import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import 'game_types.dart';

import 'widgets/tile.dart';
import 'widgets/keyboard.dart';


// sender guess til backend
// TO-do => skal også kunne behandle response fra backend, og opdatere guesses
class Game {
  final socket =io.io('http://localhost:8080', io.OptionBuilder()
    .setTransports(['websocket'])
    .disableAutoConnect()
    .build());

  final void Function()? onUpdate;
  List<List<LetterInfo>> guesses = [];

  Game({this.onUpdate}) {
    socket.connect();
    socket.on('guess_validation', (data) {
      print ('Recieved guess validation: $data');
      
      if (data['is_valid'] != true) return;

      final row = parseGuess(data as Map<String, dynamic>);
      guesses.add(row);
      onUpdate?.call();
      });
  }

  void guess(String guess) {
    socket.emit('guess', guess);
      print('Guess sent: $guess');
  }
}


// Det meste af det her er fra FLutter Tutorial https://docs.flutter.dev/learn/pathway/tutorial



class GamePage extends StatefulWidget {
  const GamePage({super.key});

  @override
  State<GamePage> createState() => _GamePageState();
}

class _GamePageState extends State<GamePage> {
  late final Game _game;
  final FocusNode _focusNode = FocusNode();
  List<String> _currentGuess = List.filled(5, '');
  int _cursorPost = 0;

  @override
  void initState() {
    super.initState();
    _game = Game(onUpdate: () => setState(() {}));
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  void _addLetter(String letter) {
    if (_cursorPost < 5) {
      setState(() {
        _currentGuess[_cursorPost] = letter;
        _cursorPost++; 
      });
    }
  }

  void _backspace() {
    if (_cursorPost > 0) {
      setState(() {
        _cursorPost--;
        _currentGuess[_cursorPost] = '';
      });
    }
  }

  void _submitGuess() {
    final guess = _currentGuess.join();
    if (guess.length == 5) {
      _game.guess(guess);
      setState(() {
        _currentGuess = List.filled(5, '');
        _cursorPost = 0;
      });
    }
  }

  void _onKey(KeyEvent event) {
    if (event is! KeyDownEvent) return;
    final key = event.logicalKey;

    if (key == LogicalKeyboardKey.backspace) {
      _backspace();
    } else if (key == LogicalKeyboardKey.enter) {
      _submitGuess();
    } else if (key.keyLabel.length == 1 &&
        RegExp(r'^[a-zA-Z]$').hasMatch(key.keyLabel)) {
      _addLetter(key.keyLabel.toUpperCase());
    }
  }

@override
Widget build(BuildContext context) {
  const int maxRows = 6;

  final boardRows = List.generate(maxRows, (rowIndex) {
    if (rowIndex < _game.guesses.length) {
      return _game.guesses[rowIndex];
    }
    if (rowIndex == _game.guesses.length) {
      return _currentGuess
          .map((char) => LetterInfo(char: char, type: HitType.miss))
          .toList();
    }
    return List.generate(
      5,
      (_) => LetterInfo(char: '', type: HitType.miss),
    );
  });

    return KeyboardListener(
      focusNode: _focusNode,
      onKeyEvent: _onKey,
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          children: [
            for (var guess in boardRows)
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  for (var letter in guess)
                    Padding(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 2.5, vertical: 2.5),
                      child: Tile(letter.char, letter.type),
                    ),
                ],
              ),
            const SizedBox(height: 16),
            Keyboard(
              onLetter: _addLetter,
              onBackspace: _backspace,
              onEnter: _submitGuess,
            ),
          ],
        ),
      ),
    );
  }
}

