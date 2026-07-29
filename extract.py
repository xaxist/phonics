import re
import json

def parse_lessons(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    lessons = {}
    current_lesson = None
    current_section = None # 'words' or 'sentences'

    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if line.startswith('Get all 262 lessons') or line.startswith('Copyright') or line.startswith('SPENCER') or line.startswith('LEARNING'):
            continue
            
        lesson_match = re.match(r'LESSON\s+(\d+)\s+-\s+(Word List|Sentences)', line)
        if lesson_match:
            lesson_num = int(lesson_match.group(1))
            section_type = lesson_match.group(2)
            
            if lesson_num not in lessons:
                lessons[lesson_num] = {
                    'id': lesson_num,
                    'title': f'Lesson {lesson_num}',
                    'rule': '',
                    'words': [],
                    'sentences': []
                }
            
            current_lesson = lesson_num
            current_section = 'words' if section_type == 'Word List' else 'sentences'
            continue

        if current_lesson is None:
            continue
            
        # Check if line is a rule (e.g. "Closed Syllables » Short Vowels » a = /ă/")
        if '»' in line or (line.startswith('Sight Words') and len(line) < 30) or line.startswith('Magic E Syllables'):
            lessons[current_lesson]['rule'] = line
            continue

        if current_section == 'words':
            # split by space to get individual words
            words = line.split()
            lessons[current_lesson]['words'].extend(words)
        elif current_section == 'sentences':
            # It's a sentence line
            # Often sentences can span multiple lines if they are long, 
            # but usually start with "number) ". Let's join them if they don't start with number.
            if re.match(r'^\d+\)', line):
                lessons[current_lesson]['sentences'].append(line)
            else:
                if len(lessons[current_lesson]['sentences']) > 0:
                    lessons[current_lesson]['sentences'][-1] += ' ' + line
                else:
                    lessons[current_lesson]['sentences'].append(line)
                    
    # cleanup words list (remove numbers if any)
    for l in lessons.values():
        clean_words = []
        for w in l['words']:
            w_clean = re.sub(r'[^a-zA-Z\'-]', '', w)
            if w_clean:
                clean_words.append(w_clean)
        l['words'] = clean_words

    lesson_list = [lessons[k] for k in sorted(lessons.keys())]
    
    with open('lessons.json', 'w', encoding='utf-8') as f:
        json.dump(lesson_list, f, indent=2, ensure_ascii=False)
        
    print(f"Extracted {len(lesson_list)} lessons.")

if __name__ == '__main__':
    parse_lessons('words.txt')
