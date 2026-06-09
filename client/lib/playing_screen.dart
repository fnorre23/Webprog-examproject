import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:async';

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
  int _secondsLeft = 120;
  Timer? _timer;
  
  @override
  void initState() {
    super.initState();
    widget.playerProcess.onUpdate = () {
      if (widget.playerProcess.hasFinished) _timer?.cancel();
      setState(() {});
    };


    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_secondsLeft > 0) {
          _secondsLeft--;
          if (_secondsLeft == 0) widget.playerProcess.timedOut();
        }
      });
    });

    WidgetsBinding.instance.addPostFrameCallback((_) { 
      _focusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
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
      widget.playerProcess.guess(guess, _secondsLeft);
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
    if (widget.playerProcess.hasFinished) return;
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

    final minutes = _secondsLeft ~/ 60;
    final seconds = _secondsLeft % 60;
    final timerDisplay = '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';

    return Row(
      children: [

        const SizedBox(width: 160),

        Expanded(
          child: Stack(
            alignment: Alignment.center,
            children: [      
              KeyboardListener(
                focusNode: _focusNode,
                onKeyEvent: _onKey,
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Padding(
                    padding: const EdgeInsets.all(100.0),
                    child: Column(
                      children: [
                        const SizedBox(height: 100),
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
                          onLetter: widget.playerProcess.hasFinished ? (_) {} : _addLetter,
                          onBackspace: widget.playerProcess.hasFinished ? () {} : _backspace,
                          onEnter: widget.playerProcess.hasFinished ? () {} : _submitGuess,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                child: Center(
                  child: Text(
                    timerDisplay,
                    style: const TextStyle(fontSize: 50,fontWeight: FontWeight.bold),
                  ),
                )
              )
            ],
          ),
        ),


        Container(
          width: 160,
          color: Colors.grey.shade100,
          child: SingleChildScrollView(
            child: Column(
              children: [
                const Padding(
                  padding: EdgeInsets.all(8),
                  child: Text('Players', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                  for (final player in widget.playerProcess.otherPlayers.values)
                    _buildMiniBoard(player),               
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMiniBoard(OtherPlayerState player) {
    const  tileSize = 18.0;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(player.name, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          for (int row = 0; row < 6; row++)
            Padding(
              padding: const EdgeInsets.only(bottom:2),
              child: Row(
                children: [
                  for (int col = 0; col < 5; col++)
                    Padding(
                      padding: const EdgeInsets.only(right: 2),
                      child: Container(
                        width: tileSize,
                        height: tileSize,
                        color: row < player.guesses.length
                          ? switch (player.guesses[row][col].type) {
                            HitType.hit => Colors.green,
                            HitType.partial => Colors.yellow,
                            HitType.miss => Colors.grey,
                            null => Colors.grey.shade300,
                          }
                          : Colors.grey.shade200,
                      ),
                    ),
                ],
              ),
            ),
        ],
      ),
    );
  }

}
