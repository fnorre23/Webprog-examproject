import 'package:flutter/material.dart';
import '../game_types.dart';

class MiniBoard extends StatefulWidget {
  final OtherPlayerState player;
  final bool isCountingDown;

  const MiniBoard(this.player, {super.key, this.isCountingDown = false});

  @override
  State<MiniBoard> createState() => _MiniBoardState();
}

class _MiniBoardState extends State<MiniBoard> {
  bool _red = false;
  bool _sliding = false;

  @override
  void didUpdateWidget(MiniBoard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (!oldWidget.player.hasLost && widget.player.hasLost) {
      setState(() => _red = true);
    }
    if (!oldWidget.isCountingDown && widget.isCountingDown && _red) {
      setState(() => _sliding = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    const tileSize = 18.0;
    return AnimatedSize(
      duration: const Duration(milliseconds: 2000),
      curve: Curves.easeIn,
      child: SizedBox(
        height: _sliding ? 0 : null,
        child: ClipRect(
          child: AnimatedSlide(
            offset: _sliding ? const Offset(1.5, 0) : Offset.zero,
            duration: const Duration(milliseconds: 2000),
            curve: Curves.easeIn,
            child: AnimatedOpacity(
              opacity: _sliding ? 0.0 : 1.0,
              duration: const Duration(milliseconds: 2000),
              child: Container(
                decoration: _red
                    ? BoxDecoration(
                        color: Colors.red.shade100,
                        borderRadius: BorderRadius.circular(4),
                        border: Border.all(color: Colors.red.shade400, width: 1.5),
                      )
                    : null,
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 18),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(widget.player.name, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
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
                                    color: row < widget.player.guesses.length
                                      ? switch (widget.player.guesses[row][col].type) {
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
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
