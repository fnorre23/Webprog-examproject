import 'package:flutter/material.dart';

void main() {
  runApp(const MainApp());
}


// siger ret meget sig selv..
enum PlayerState { lobby, playing, spectating }


// Hvad der styrer hvilken skærm der vises, self afhænging af state
class MainApp extends StatefulWidget {
  const MainApp({super.key});

  @override
  State<MainApp> createState() => _MainAppState();
}


// Det virker PT, skal nok ændres lidt
// TO DO => opdel alle states i nye filer, og importer der her, så det ikke bliver alt for rodet
class _MainAppState extends State<MainApp> {
  PlayerState _playerState = PlayerState.lobby;
  void _setPlayerState(PlayerState newState) => setState(() => _playerState = newState);


  @override
  Widget build(BuildContext context) {
    Widget body; 

    switch (_playerState) {
      case PlayerState.lobby:
        body = LobbyScreen(onPlayerStateChange: _setPlayerState);
        break;
      case PlayerState.playing:
        body = const Text('Playing Screen');
        break;
      case PlayerState.spectating:
        body = const Text('Spectating Screen');
        break;
    }
// Hvis bare appbar og body igennem alle states
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text('Wordle Battle Royale')),
        body: Center(child: body),
      ),
    );
  }
}

class LobbyScreen extends StatelessWidget {
  final void Function(PlayerState) onPlayerStateChange;

  const LobbyScreen({super.key, required this.onPlayerStateChange});

  @override
  Widget build(BuildContext context) {
    return Column(mainAxisSize: MainAxisSize.min, children: [
      const Text ('Lobby', style: TextStyle(fontSize: 28)),
      const SizedBox(height:12),
      ElevatedButton(
        onPressed: () => onPlayerStateChange(PlayerState.playing),
        child: const Text('Start Game'),
      )
    ]);
  }
}
