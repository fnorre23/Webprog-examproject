import 'package:flutter/material.dart';
import '../game_types.dart';

class MiniBoard extends StatelessWidget {
  final OtherPlayerState player;

  const MiniBoard(this.player, {super.key});

  @override
  Widget build(BuildContext context) {
    const tileSize = 18.0;
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(player.name, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          for (int row = 0; row < 6; row++)
            Padding(
              padding: const EdgeInsets.only(bottom: 2),
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