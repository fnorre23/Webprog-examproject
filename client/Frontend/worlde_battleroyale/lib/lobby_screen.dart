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
  bool _isReady = false;


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

// Her er alt der har med pop-up navgivning af spilleren.

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

  // Det her er den faktiske lobby screen

  @override
  Widget build(BuildContext context) {
    return Column(mainAxisSize: MainAxisSize.min, children: [
      const Text ('Lobby', style: TextStyle(fontSize: 28)),
      const SizedBox(height:12),

    _isReady
      ? OutlinedButton(
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(200, 75),
            side: const BorderSide(color: Colors.red, width: 3),
            backgroundColor: Colors.red[300],
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(35),
            ),
          ),
          onPressed: () {
            setState(() => setState(() => _isReady = false));
          },
          child: const Text('CANCEL', style: TextStyle(fontSize: 30, color: Color.fromARGB(200, 230, 230, 230))),
        )
      : ElevatedButton(
        style: ElevatedButton.styleFrom(
          minimumSize: const Size(200, 75),
          backgroundColor: Colors.green[400],
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(35),
          ),
        ),
        onPressed: () => setState(() => _isReady = true),
        child: const Text('READY', style: TextStyle(fontSize: 30, color: Color.fromARGB(200, 230, 230, 230))),
      ),
    ]);
  }
}