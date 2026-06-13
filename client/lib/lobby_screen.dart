import 'package:flutter/material.dart';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';

import 'main.dart';
import 'player_processing.dart';

class LobbyScreen extends StatefulWidget {
  final void Function(PlayerState) onPlayerStateChange;
  final PlayerProcess playerProcess;

  const LobbyScreen({super.key, required this.playerProcess, required this.onPlayerStateChange});

  @override
  State<LobbyScreen> createState() => _LobbyScreenState();
}

class _LobbyScreenState extends State<LobbyScreen> {
  final keyPlayerName = 'player_name';
  final TextEditingController _textEditingController = TextEditingController();
  final FocusNode _focusNode = FocusNode();

  bool _isReady = false;
  bool _gameStarting = false;
  int _countdown = 5;
  Timer? _timer;
  Map<String, String> _players = {};


  @override
  void initState() {
    super.initState();
    if (widget.playerProcess.playerName != null) {
      widget.playerProcess.joinGame(widget.playerProcess.playerName!);
    }
    widget.playerProcess.onStateUpdate = (players) => setState(() => _players = players);
    widget.playerProcess.onPhaseChange = (phase) {
      if (!mounted) return;
      if (phase == 'playing') {
        if (widget.playerProcess.hasLost) {
          widget.onPlayerStateChange(PlayerState.spectating); //for players that joined while a game is active
        } else if (_isReady) {
          _startCountdown();
        }
      }
    };
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _showDialogIfFirstLoaded();
    });
  }

  @override
  void dispose() {
    _textEditingController.dispose();
    _focusNode.dispose();
    _timer?.cancel();
    _isReady = false;
    widget.playerProcess.onStateUpdate = null;
    widget.playerProcess.onPhaseChange = null;
    super.dispose();
  }

  Future<void> _playerNameSubmit() async {
    final playerName = _textEditingController.text.trim();
    if (playerName.isEmpty) return;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(keyPlayerName, playerName);
    widget.playerProcess.joinGame(playerName);
    Navigator.of(context).pop();
  }

  void _startCountdown() {
    _cancelCountdown();
    setState(() => _gameStarting = true);
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
    setState(() {
       _countdown = 5;
       _gameStarting = false;
    });
  }

// Her er alt der har med pop-up navgivning af spilleren.

  Future<void> _showDialogIfFirstLoaded() async {
    if (widget.playerProcess.playerName != null) return;

    final prefs = await SharedPreferences.getInstance();
    final String? storedName = prefs.getString(keyPlayerName);

    if (storedName != null) {
      _textEditingController.text = storedName;
    }

    await showDialog(
      context: context,
      barrierDismissible: false,
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
  }

  // Det her er den faktiske lobby screen

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        if (_players.isNotEmpty)
          Text(
            'You have joined the game of \'${_players.values.first}\'',
            style: const TextStyle(fontSize: 28),
          ),
        const SizedBox(height: 12),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Venstre column
                Expanded(
                  flex: 2,
                  child: Container(
                    margin: const EdgeInsets.all(16),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.1),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        )
                      ]
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        const Text('Game History:', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        if (widget.playerProcess.gameHistory.isEmpty)
                          const Text('No game played yet', style: TextStyle(fontSize: 16))
                        else
                          for (int i = 0; i < widget.playerProcess.gameHistory.length; i++)
                            Text(
                              'Game ${i + 1}: ${widget.playerProcess.gameHistory[i]} won!',
                              style: const TextStyle(fontSize: 16),
                            ),
                      ],
                    ),
                  ),
                ),

                // Midterste collumn
                Expanded(
                  flex: 3,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
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
                                widget.playerProcess.unready();
                                _cancelCountdown();
                              },
                              child: const Text('CANCEL', style: TextStyle(fontSize: 30, color: Color.fromARGB(255, 255, 255, 255))),
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
                                widget.playerProcess.readyUp();
                              },
                              child: const Text('READY', style: TextStyle(fontSize: 30, color: Color.fromARGB(255, 255, 255, 255))),
                            ),
                      SizedBox(
                        height: 40,
                        child: _gameStarting
                            ? Text(
                              _countdown > 0 ? 'Game starting in $_countdown...' : 'Go!',
                              style: const TextStyle(fontSize: 28),
                            )
                            : null,
                      )
                    ],
                  ),
                ),

                // Højre column
                Expanded(
                  flex: 2,
                  child: Container(
                    margin: const EdgeInsets.all(16),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.1),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        ),
                      ]
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Center(
                          child: const Text('Players in lobby:', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                        ),
                        const SizedBox(height: 8),
                        for (var playerName in _players.values)
                          Text(playerName, style: const TextStyle(fontSize: 18)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        ],
      );
    }

}