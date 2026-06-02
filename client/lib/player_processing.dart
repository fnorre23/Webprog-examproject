import 'package:socket_io_client/socket_io_client.dart' as io;
import 'game_types.dart';

class PlayerProcess {
  final socket = io.io('http://localhost:8080', io.OptionBuilder()
    .setTransports(['websocket', 'polling'])
    .disableAutoConnect()
    .build());

  void Function()? onUpdate;
  void Function(Map<String, String>)? onStateUpdate;
  List<List<LetterInfo>> guesses = [];

  PlayerProcess({this.onUpdate, this.onStateUpdate}) {
    socket.connect();

    socket.on('state', (data) {
      if (data == null || data['players'] == null) return;
      final playersData = Map<String, dynamic>.from(data['players']);
      final players = playersData.map((id, player) => MapEntry(id, (player as Map)['name'] as String));
      onStateUpdate?.call(players);
    });

    socket.on('guess_validation', (data) {
      print('Recieved guess validation: $data');
      final map = Map<String, dynamic>.from(data as Map);      
      if (data['is_valid'] != true) return;
      final row = parseGuess(map);
      guesses.add(row);
      onUpdate?.call();
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

  void guess(String guess) {
    socket.emit('guess', guess);
      print('Guess sent: $guess');
  }
}