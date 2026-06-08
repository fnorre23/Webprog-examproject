import 'package:flutter/material.dart';


import 'playing_screen.dart';
import 'lobby_screen.dart';
import 'player_processing.dart';


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
  late final PlayerProcess _playerProcess;

  @override
  void initState() {
    super.initState();
    _playerProcess = PlayerProcess();
  }

  @override
  Widget build(BuildContext context) {
    Widget body;
    switch (_playerState) {
      case PlayerState.lobby:
        body = LobbyScreen(playerProcess: _playerProcess, onPlayerStateChange: _setPlayerState);
      case PlayerState.playing:
        body = GamePage(playerProcess: _playerProcess);
      case PlayerState.spectating:
        body = const Text('Spectating Screen');
        break;
    }
// Viser bare appbar og body igennem alle states
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: const Text('Wordle Battle Royale')),
        body: Center(child: body),
      ),
    );
  }
}

