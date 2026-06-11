import 'package:flutter/material.dart';
import '../game_types.dart';

class Tile extends StatelessWidget {
  const Tile(this.letter, this.hitType, {super.key, required this.index, this.size = 70});

  final String letter;
  final HitType? hitType;
  final int index;
  final double size;

  @override
  Widget build(BuildContext context) {
    final container = AnimatedContainer(
      duration: Duration(milliseconds: 500),
      curve: Curves.bounceIn,
      height: size,
      width: size,
      decoration: BoxDecoration(
        border: Border.all(color: letter.isNotEmpty ? Colors.grey.shade900 : Colors.grey.shade400),
        color: switch (hitType) {
          HitType.hit => Colors.green,
          HitType.partial => Colors.yellow,
          HitType.miss => Colors.grey,
          null => Colors.transparent,
        },
      ),
      child: Center(
        child: Text(
          letter.toUpperCase(),
          style: const TextStyle(
            fontSize: 35,
            fontWeight: FontWeight.bold,
            color: Colors.black,
          ),
        ),
      ),
    );

    if (letter.isEmpty) return container;

    return TweenAnimationBuilder<double>(
      key: ValueKey('$index-$letter'),
      tween: Tween(begin: 1.2, end: 1.0),
      duration: const Duration(milliseconds: 80),
      curve: Curves.easeOut,
      builder: (context, scale, child) => Transform.scale(scale: scale, child: child),
      child: container,
    );
  }
}