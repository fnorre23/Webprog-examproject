import 'package:flutter/material.dart';


import 'playing_screen.dart';
import 'lobby_screen.dart';
import 'spectating_screen.dart';
import 'player_processing.dart';



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
  late final PlayerProcess _playerProcess;

  @override
  void initState() {
    super.initState();
    _playerProcess = PlayerProcess(); // socket connects here
  }

  @override
  Widget build(BuildContext context) {
    Widget body;
    switch (_playerState) {
      case PlayerState.lobby:
        body = LobbyScreen(playerProcess: _playerProcess, onPlayerStateChange: _setPlayerState);
      case PlayerState.playing:
        body = GamePage(playerProcess: _playerProcess, onPlayerStateChange: _setPlayerState);
      case PlayerState.spectating:
        body = SpectatingScreen(playerProcess: _playerProcess, onPlayerStateChange: _setPlayerState);
    }
// Shows appbar through all states
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text('Wordle Battle Royale')),
        body: Center(child: body),
      ),
    );
  }
}

