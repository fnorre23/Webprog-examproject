import 'package:flutter/material.dart';
import '../game_types.dart';

import 'tile.dart';

class WordleBoard extends StatelessWidget {
  final List<List<LetterInfo>> guesses;
  final List<String> currentGuess;

  const WordleBoard({
    super.key,
    required this.guesses,
    required this.currentGuess,
  });

  @override
  Widget build(BuildContext context) {
    const int maxRows = 6;

    final boardRows = List.generate(maxRows, (rowIndex) {
      if (rowIndex < guesses.length) return guesses[rowIndex];
      if (rowIndex == guesses.length) {
        return currentGuess.map((char) => LetterInfo(char: char, type: null)).toList();
      }
      return List.generate(5, (_) => LetterInfo(char: '', type: null));
    });

    return Column(
      children: [
        for (var row in boardRows)
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              for (var i = 0; i < row.length; i++)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2.5, vertical: 2.5),
                  child: Tile(row[i].char, row[i].type, index: i),
                ),
            ],
          ),
      ],
    );
  }
}