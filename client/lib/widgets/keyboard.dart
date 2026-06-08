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


  //Keyboard widget der bruger button widget

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 600,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (final row in _rows)
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (row == _rows.last)
                  _KeyButton(label: 'ENTER', onTap: onEnter, flex: 5),
                for (final char in row.split(''))
                  _KeyButton(label: char, onTap: () => onLetter(char)),
                if (row == _rows.last)
                  _KeyButton(label: '⌫', onTap: onBackspace, flex: 4),
              ],
            ),
        ],
      ),
    );
  }
}



 // Button widget til keyboard

class _KeyButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final int flex;

  const _KeyButton({required this.label, required this.onTap, this.flex = 3});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 20.0 * flex,
      child: Padding(
        padding: const EdgeInsets.all(3),
        child: Material(
          color: const Color.fromARGB(255, 220, 220, 220),
          borderRadius: BorderRadius.circular(4),
          child: InkWell(
            onTap: onTap,
            borderRadius: BorderRadius.circular(4),
            child: SizedBox(
              height: 70,
              child: Center(
                child: Text(
                  label,
                  style: const TextStyle(
                    color: Colors.black,
                    fontWeight: FontWeight.bold,
                    fontSize: 20,
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