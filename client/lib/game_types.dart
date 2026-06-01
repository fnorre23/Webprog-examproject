
enum HitType { hit, partial, miss }


//Behandler json fra backend
class LetterInfo {
  final String char;
  final HitType type;

  LetterInfo({required this.char, required this.type});

  factory LetterInfo.fromJson(Map<String, dynamic> json) {
    final correctIdx = json['correct_idx'] as bool;
    final inWord = json['in_word'] as bool;

    final HitType type;
    if (correctIdx) {
      type = HitType.hit;
    } else if (inWord) {
      type = HitType.partial;
    } else {
      type = HitType.miss;
    }
    return LetterInfo(char: json['char'], type: type);
  }
}

  List<LetterInfo> parseGuess(Map<String, dynamic> json) {
    final chars = json['character_info'] as List;
    return chars
        .map((c) => LetterInfo.fromJson(c as Map<String, dynamic>))
        .toList();
}