import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'game_types.dart';
import 'player_processing.dart';

import 'widgets/tile.dart';
import 'widgets/keyboard.dart';

class GamePage extends StatefulWidget {
  final PlayerProcess playerProcess;
  const GamePage({super.key, required this.playerProcess});

  @override
  State<GamePage> createState() => _GamePageState();
}

class _GamePageState extends State<GamePage> {
  final FocusNode _focusNode = FocusNode();
  List<String> _currentGuess = List.filled(5, '');
  int _cursorPost = 0; // hvor vi er i gættet, altså hvor næste bogstav skal ind, eller hvor backspace skal fjerne fra
  
  @override
  void initState() {
    super.initState();
    widget.playerProcess.onUpdate = () => setState(() {});
    WidgetsBinding.instance.addPostFrameCallback((_) { 
      _focusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _focusNode.dispose();
    widget.playerProcess.onUpdate = null;
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
    print('Submitting guess: $guess, length: ${guess.length}, socket connected: ${widget.playerProcess.socket.connected}');
    if (guess.length == 5) {
      widget.playerProcess.guess(guess);
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

  // Her laver vi de 6 rækker til gæt
  @override
  Widget build(BuildContext context) {
    const int maxRows = 6;

    final boardRows = List.generate(maxRows, (rowIndex) {
      if (rowIndex < widget.playerProcess.guesses.length) {
        return widget.playerProcess.guesses[rowIndex];
      }
      if (rowIndex == widget.playerProcess.guesses.length) {
        return _currentGuess
            .map((char) => LetterInfo(char: char, type: null))
            .toList();
      }
      return List.generate(
        5,
        (_) => LetterInfo(char: '', type: null),
      );
    });

      return KeyboardListener(
        focusNode: _focusNode,
        onKeyEvent: _onKey,
        child: FittedBox(
          fit: BoxFit.scaleDown,
          child: Padding(
            padding: const EdgeInsets.all(100.0),
            child: Column(
              children: [
                for (var guess in boardRows)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      for (var i = 0; i < guess.length; i++)
                        Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 2.5, vertical: 2.5),
                          child: Tile(guess[i].char, guess[i].type,index: i),
                        ),
                    ],
                  ),
                const SizedBox(height: 150),
                Keyboard(
                  onLetter: _addLetter,
                  onBackspace: _backspace,
                  onEnter: _submitGuess,
                ),
              ],
            ),
          ),
        ),
      );
  }
}

