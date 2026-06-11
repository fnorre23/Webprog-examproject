import 'package:flutter/material.dart';
import 'game_types.dart';
import 'player_processing.dart';
import 'widgets/tile.dart';

class SpectatingScreen extends StatefulWidget {
  final PlayerProcess playerProcess;
  const SpectatingScreen({super.key, required this.playerProcess});

  @override
  State<SpectatingScreen> createState() => _SpectatingScreenState();
}

class _SpectatingScreenState extends State<SpectatingScreen> {
  @override
  void initState() {
    super.initState();
    widget.playerProcess.onUpdate = () => setState(() {});
    widget.playerProcess.onRoundReset = () => setState(() {});
  }

  @override
  void dispose() {
    widget.playerProcess.onUpdate = null;
    widget.playerProcess.onRoundReset = null;
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final activePlayers = widget.playerProcess.otherPlayers.values
        .where((p) => !p.hasLost)
        .toList();

    return Column(
      children: [
        const Padding(
          padding: EdgeInsets.all(16),
          child: Text('Spectating', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
        ),
        Expanded(
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                for (final player in activePlayers)
                  Padding(
                    padding: const EdgeInsets.all(24),
                    child: _SpectatorBoard(player: player),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _SpectatorBoard extends StatelessWidget {
  final OtherPlayerState player;
  const _SpectatorBoard({required this.player});

  @override
  Widget build(BuildContext context) {
    const tileSize = 48.0;
    return Column(
      children: [
        Text(player.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        for (int row = 0; row < 6; row++)
          Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: Row(
              children: [
                for (int col = 0; col < 5; col++)
                  Padding(
                    padding: const EdgeInsets.only(right: 4),
                    child: Tile(
                      row < player.guesses.length ? player.guesses[row][col].char : '',
                      row < player.guesses.length ? player.guesses[row][col].type : null,
                      index: row * 5 + col,
                      size: tileSize,
                    ),
                  ),
              ],
            ),
          ),
      ],
    );
  }
}