enum HitType { hit, partial, miss }

class LetterInfo {    //process' json from backend
  final String char;
  final HitType? type;

  LetterInfo({required this.char, required this.type});

  factory LetterInfo.fromJson(Map<String, dynamic> json) {
    final correctIdx = json['correct_idx'] as bool;
    final inWord = json['in_word'] as bool;

    final HitType type;
    if (correctIdx) {
      type = HitType.hit;       //green
    } else if (inWord) {
      type = HitType.partial;   //yellow
    } else {
      type = HitType.miss;      //grey
    }
    return LetterInfo(char: (json['char'] as String?) ?? '', type: type);
  }
}
  
  List<LetterInfo> parseGuess(Map<String, dynamic> json) {
    final chars = json['character_info'] as List;
    return chars
        .map((c) => LetterInfo.fromJson(c as Map<String, dynamic>))
        .toList();
}

class OtherPlayerState {
  final String name;
  final List<List<LetterInfo>> guesses;
  final bool hasLost;

  OtherPlayerState({required this.name, required this.guesses, required this.hasLost});
}