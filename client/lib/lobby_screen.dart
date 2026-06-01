import 'package:flutter/material.dart';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';

import 'main.dart';
import 'player_processing.dart';

class LobbyScreen extends StatefulWidget {
  final void Function(PlayerState) onPlayerStateChange;

  const LobbyScreen({super.key, required this.onPlayerStateChange});

  @override
  State<LobbyScreen> createState() => _LobbyScreenState();
}

class _LobbyScreenState extends State<LobbyScreen> {
  final keyIsFirstLoaded = 'is_first_loaded';
  final TextEditingController _textEditingController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  late final PlayerProcess _playerProcess;

  bool _isReady = false;
  int _countdown = 5;
  Timer? _timer;
  Map<String, String> _players = {};


  @override
  void initState() {
    super.initState();
     _playerProcess = PlayerProcess(
      onStateUpdate: (players) => setState(() => _players = players),
    );
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _showDialogIfFirstLoaded();
    });
  }

  @override
  void dispose() {
    _textEditingController.dispose();
    _focusNode.dispose();
    _playerProcess.socket.disconnect();
    _timer?.cancel();
    super.dispose();
  }

  void _playerNameSubmit() {
    final playerName = _textEditingController.text.trim();
    if (playerName.isEmpty) return;
    _playerProcess.joinGame(playerName);
    Navigator.of(context).pop();
    print ('Player name submitted: ${_textEditingController.text.trim()}');
  }

  void _startCountdown() {
    _cancelCountdown();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_countdown > 0) {
          _countdown--;
        } else {
          timer.cancel();
          widget.onPlayerStateChange(PlayerState.playing);
        }
      });
    });
  }

  void _cancelCountdown() {
    _timer?.cancel();
    setState(() => _countdown = 5);
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
              },
            ),  
          actions: [
            TextButton(
              child: const Text('Submit'),
              onPressed: () {
                _playerNameSubmit();
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
            setState(() => _isReady = false);
            _playerProcess.unready();
            print('Player is not ready');
            _cancelCountdown();
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
        onPressed: () {
          setState(() => _isReady = true);
          _playerProcess.readyUp();
          print('Player is ready');
          _startCountdown();
        },
        child: const Text('READY', style: TextStyle(fontSize: 30, color: Color.fromARGB(200, 230, 230, 230))),
      ),

      const SizedBox(height: 12),
      if (_isReady)
        Text(
          _countdown > 0 ? 'Game starting in $_countdown...' : 'Go!',
          style: const TextStyle(fontSize: 28),
        ),

        const SizedBox(height: 24),
        const Text('Players in lobby:', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        for (var playerName in _players.values)
          Text(playerName, style: const TextStyle(fontSize: 18)),
    ]);
  }
}