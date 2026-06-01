import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import 'game_types.dart';
import 'player_processing.dart';

import 'widgets/tile.dart';
import 'widgets/keyboard.dart';



class GamePage extends StatefulWidget {
  const GamePage({super.key});

  @override
  State<GamePage> createState() => _GamePageState();
}

class _GamePageState extends State<GamePage> {
  late final Game _game;
  final FocusNode _focusNode = FocusNode();
  List<String> _currentGuess = List.filled(5, '');
  int _cursorPost = 0; // hvor vi er i gættet, altså hvor næste bogstav skal ind, eller hvor backspace skal fjerne fra


  
  @override
  void initState() {
    super.initState();
    _game = Game(onUpdate: () => setState(() {}));
    WidgetsBinding.instance.addPostFrameCallback((_) {  // sørger for at keyboard listeneren får fokus når skærmen kommer frem
      _focusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  // tilføjer bogstav til gættet og opdaterer cursor
  void _addLetter(String letter) {  
    if (_cursorPost < 5) {
      setState(() {
        _currentGuess[_cursorPost] = letter;
        _cursorPost++; 
      });
    }
  }

  // fjerner bogstav fra gættet og opdaterer cursor
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

  // håndterer alt input fra keyboard, altså både fysisk og on-screen keyboard
  // LogicalKeyboardKey er noget Flutter hejs, der gør vi kan bruge computerens keyboard
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

