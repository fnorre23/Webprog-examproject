import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(const MainApp());
}

enum PlayerState { lobby, playing, spectating }

class MainApp extends StatefulWidget {
  const MainApp({super.key});

  @override
  State<MainApp> createState() => _MainAppState();
}

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
      default:
        body = LobbyScreen(onPlayerStateChange: _setPlayerState);
    }

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
