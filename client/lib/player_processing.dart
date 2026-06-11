import 'package:socket_io_client/socket_io_client.dart' as io;
import 'game_types.dart';

class PlayerProcess {
  final socket = io.io('http://localhost:8080', io.OptionBuilder()
    .setTransports(['websocket', 'polling'])
    .disableAutoConnect()
    .build());

  void Function()? onUpdate;
  void Function(String)? onPhaseChange;
  void Function()? onRoundReset;
  void Function(Map<String, String>)? onStateUpdate;
  Map<String, OtherPlayerState> otherPlayers = {};
  List<List<LetterInfo>> guesses = [];
  bool hasFinished = false;
  bool hasLost = false;
  void Function()? onLost;
  void Function(String reason)? onLostContext;

  PlayerProcess({this.onUpdate, this.onStateUpdate}) {
    socket.connect();

    socket.on('state', (data) {
      if (data == null || data['players'] == null) return;

      print('State received: phase=${data['phase']}');

      final playersData = Map<String, dynamic>.from(data['players']);
      final players = playersData.map((id, player) => MapEntry(id, (player as Map)['name'] as String));
      onStateUpdate?.call(players);

      final myData = playersData[socket.id];
      if (myData != null && (myData as Map)['has_lost'] == true && !hasLost) {
        hasLost = true;
      }

      final phase = data['phase'] as String?;
      if (phase != null) {
        print('Calling onPhaseChange with $phase, hasListener: ${onPhaseChange != null}');
        onPhaseChange?.call(phase);
      }

      final newOtherPlayers = <String, OtherPlayerState>{};
      for (final entry in playersData.entries) {
        if (entry.key == socket.id) continue;
        final player = entry.value as Map;
        final rawGuesses = player['guesses'] as List? ?? [];
        final guesses = rawGuesses
          .map((guess) => parseGuess(Map<String, dynamic>.from(guess as Map)))
          .toList();
        newOtherPlayers[entry.key] = OtherPlayerState(
          name: player['name'] as String,
          guesses: guesses,
          hasLost: player['has_lost'] as bool? ?? false,
        );
      }

      otherPlayers = newOtherPlayers;
      onUpdate?.call();
    });

    socket.on('guess_validation', (data) {
      print('Recieved guess validation: $data');
      final map = Map<String, dynamic>.from(data as Map);
      if (data['is_valid'] != true) return;
      final row = parseGuess(map);
      guesses.add(row);
      if (data['was_correct'] == true || guesses.length >= 6) hasFinished = true;
      onUpdate?.call();
    });

    socket.on('next_round', (_) {
      guesses.clear();
      hasFinished = false;
      hasLost = false;
      onRoundReset?.call();
    });

    socket.on('lost_timeout', (_) {
      if (hasLost) return;
      hasFinished = true;
      hasLost = true;
      onLostContext?.call('Time\'s up!');
      onLost?.call();
    });

    socket.on('lost_incorrect_guesses', (_) {
      if (hasLost) return;
      hasFinished = true;
      hasLost = true;
      onLostContext?.call('Out of guesses!');
      onLost?.call();
    });

  }



  void joinGame(String playerName) {
    socket.emit('join', playerName);
      print('Player name sent: $playerName');
  }

  void readyUp() {
    socket.emit('ready_up');
      print('Player is ready');
  }

  void unready() {
    socket.emit('unready');
      print('Player is not ready');
  }

  void guess(String guess, int timeLeft) {
    socket.emit('guess', {'guess': guess, 'time_left': timeLeft});
      print('Guess sent: $guess');
  }

  void timedOut() {
    if (hasFinished) return;
    hasFinished = true;
    socket.emit('timed_out');
    print('Player timed out');
  }
}