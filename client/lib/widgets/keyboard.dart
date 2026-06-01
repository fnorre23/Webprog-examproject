import 'package:flutter/material.dart';


class Keyboard extends StatelessWidget {
  final void Function(String) onLetter;
  final VoidCallback onBackspace;
  final VoidCallback onEnter;

  const Keyboard({
    super.key,
    required this.onLetter,
    required this.onBackspace,
    required this.onEnter,
  });

  static const _rows = [
    'QWERTYUIOP',
    'ASDFGHJKL',
    'ZXCVBNM',
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (final row in _rows)
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (row == _rows.last)
                _KeyButton(label: 'ENTER', onTap: onEnter, flex: 2),
              for (final char in row.split(''))
                _KeyButton(label: char, onTap: () => onLetter(char)),
              if (row == _rows.last)
                _KeyButton(label: '⌫', onTap: onBackspace, flex: 2),
            ],
          ),
      ],
    );
  }
}

class _KeyButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final int flex;

  const _KeyButton({required this.label, required this.onTap, this.flex = 1});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      flex: flex,
      child: Padding(
        padding: const EdgeInsets.all(2),
        child: ElevatedButton(
          style: ElevatedButton.styleFrom(
            padding: const EdgeInsets.symmetric(vertical: 16),
          ),
          onPressed: onTap,
          child: Text(label),
        ),
      ),
    );
  }
}