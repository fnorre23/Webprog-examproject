import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

// Skal i back-end
enum HitType { hit, partial, miss }


//Behandler json fra backend
class LetterInfo {
  final String char;
  final HitType type;

  LetterInfo({required this.char, required this.type});

  factory LetterInfo.fromJson(Map<String, dynamic> json) {
    return LetterInfo(
      char: json['char'],
      type: HitType.values.byName(json['type'])
    );
  }
}


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
    socket.on('response', (data) {
      print ('Recived response: $data');});
  }

  void guess(String guess) {
    socket.emit('guess', guess);
    print('Guess sent: $guess');
  }
}


// Det meste af det her er fra FLutter Tutorial https://docs.flutter.dev/learn/pathway/tutorial

class Tile extends StatelessWidget {
  const Tile(this.letter, this.hitType, {super.key});

  final String letter;
  final HitType hitType;

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: Duration(milliseconds: 500),
      curve: Curves.bounceIn,
      height: 60,
      width: 60,
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade300),
        color: switch (hitType) {
          HitType.hit => Colors.green,
          HitType.partial => Colors.yellow,
          HitType.miss => Colors.grey,
          _ => Colors.white,
        },
      ),
      child: Center(
        child: Text(
          letter.toUpperCase(),
          style: Theme.of(context).textTheme.titleLarge,
        ),
      ),
    );
  }
}

class GamePage extends StatefulWidget {
  const GamePage({super.key});

  @override
  State<GamePage> createState() => _GamePageState();
}

class _GamePageState extends State<GamePage> {
  late final Game _game;

  @override
  void initState() {
    super.initState();
    _game = Game(onUpdate: () => setState(() {}));
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Column(
        children: [
          for (var guess in _game.guesses)
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                for (var letter in guess)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 2.5, vertical: 2.5),
                    child: Tile(letter.char, letter.type),
                  )
              ],
            ),
          GuessInput(
           onSubmitGuess: (String guess) {
                _game.guess(guess);
            },
          ),
        ],
      ),
    );
  }
}

class GuessInput extends StatelessWidget {
  GuessInput({super.key, required this.onSubmitGuess});

  final void Function(String) onSubmitGuess;

  final TextEditingController _textEditingController = TextEditingController();

  final FocusNode _focusNode = FocusNode();

  void _onSubmit() {
    onSubmitGuess(_textEditingController.text);
    _textEditingController.clear();
    _focusNode.requestFocus();
  }

@override
Widget build(BuildContext context) {
  const int maxRows = 6;

  final boardRows = List.generate(maxRows, (rowIndex) {
    if (rowIndex < _game.guesses.length) {
      return _game.guesses[rowIndex];
    }
    return List.generate(
      5,
      (_) => LetterInfo(char: '', type: HitType.miss),
    );
  });

  return Padding(
    padding: const EdgeInsets.all(8.0),
    child: Column(
      children: [
        for (var guess in boardRows)
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              for (var letter in guess)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 2.5, vertical: 2.5),
                  child: Tile(letter.char, letter.type),
                ),
            ],
          ),
        GuessInput(
          onSubmitGuess: (String guess) {
            _game.guess(guess);
          },
        ),
      ],
    ),
  );
}