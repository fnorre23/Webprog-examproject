import 'package:flutter/material.dart';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import 'main.dart';

class PlayerProcess {
  final socket = io.io('http://localhost:8080', io.OptionBuilder()
    .setTransports(['websocket'])
    .disableAutoConnect()
    .build());

  void playerName(String playerName) {
    socket.emit('player_name', playerName);
      print('Player name sent: $playerName');
  }
}



class LobbyScreen extends StatefulWidget {
  final void Function(PlayerState) onPlayerStateChange;

  const LobbyScreen({super.key, required this.onPlayerStateChange});

  @override
  State<LobbyScreen> createState() => _LobbyScreenPopUpPlayerNamingState();
}

class _LobbyScreenPopUpPlayerNamingState extends State<LobbyScreen> {
  final keyIsFirstLoaded = 'is_first_loaded';
  final TextEditingController _textEditingController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  final PlayerProcess _playerProcess = PlayerProcess();


  @override
  void initState() {
    super.initState();
    _playerProcess.socket.connect();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _showDialogIfFirstLoaded();
    });
  }

    @override
  void dispose() {
    _textEditingController.dispose();
    _focusNode.dispose();
    _playerProcess.socket.disconnect();
    super.dispose();
  }

  void _playerNameSubmit() {
    final playerName = _textEditingController.text.trim();
    if (playerName.isEmpty) return;
    _playerProcess.playerName(playerName);
  }

  Future<void> _showDialogIfFirstLoaded() async {
    final prefs = await SharedPreferences.getInstance();
    final bool? isFirstLoaded = prefs.getBool(keyIsFirstLoaded);

    if (isFirstLoaded != false) {
      await showDialog(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Welcome'),
          content: TextField(
              controller: _textEditingController,
              focusNode: _focusNode,
              maxLength: 15,
              decoration: const InputDecoration(
                labelText: 'Enter your name',
                border: OutlineInputBorder(),
              ),
              onSubmitted: (_) {
                _playerNameSubmit();
                Navigator.of(context).pop();
                print ('Player name submitted: ${_textEditingController.text.trim()}');
              },
            ),  
          actions: [
            TextButton(
              child: const Text('Submit'),
              onPressed: () {
                _playerNameSubmit();
                Navigator.of(context).pop();
                print ('Player name submitted: ${_textEditingController.text.trim()}');
              },
            ),
          ],
        ),
      );

      await prefs.setBool(keyIsFirstLoaded, false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(mainAxisSize: MainAxisSize.min, children: [
      const Text ('Lobby', style: TextStyle(fontSize: 28)),
      const SizedBox(height:12),
      ElevatedButton(
        onPressed: () => widget.onPlayerStateChange(PlayerState.playing),
        child: const Text('Start Game'),
      )
    ]);
  }
}