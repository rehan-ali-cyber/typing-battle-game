import type { CodeSnippet } from "../types/game";

export let codeSnippets: CodeSnippet[] = [
  {
    id: "l1-01",
    level: 1,
    title: "Sum List",
    task: "Fix this function so it returns the sum of a list.",
    starterCode: "def sum_list(nums):\n    total = 0\n    for n in nums:\n        total -= n\n    return total",
    hasBug: true,
    tests: [{ call: "sum_list([1, 2, 3])", expected: 6 }, { call: "sum_list([])", expected: 0 }, { call: "sum_list([-2, 5])", expected: 3 }]
  },
  {
    id: "l1-02",
    level: 1,
    title: "Double It",
    task: "Return double the input number.",
    starterCode: "def double(n):\n    return n + 2",
    hasBug: true,
    tests: [{ call: "double(4)", expected: 8 }, { call: "double(-3)", expected: -6 }, { call: "double(0)", expected: 0 }]
  },
  {
    id: "l1-03",
    level: 1,
    title: "First Item",
    task: "Return the first item in a list.",
    starterCode: "def first_item(items):\n    return items[1]",
    hasBug: true,
    tests: [{ call: "first_item([9, 8, 7])", expected: 9 }, { call: "first_item(['a', 'b'])", expected: "a" }]
  },
  {
    id: "l1-04",
    level: 1,
    title: "Is Even",
    task: "Return True when a number is even.",
    starterCode: "def is_even(n):\n    return n % 2 == 1",
    hasBug: true,
    tests: [{ call: "is_even(2)", expected: true }, { call: "is_even(7)", expected: false }, { call: "is_even(0)", expected: true }]
  },
  {
    id: "l1-05",
    level: 1,
    title: "Greeting",
    task: "Return a friendly greeting for the given name.",
    starterCode: "def greet(name):\n    message = 'Hello, ' + names\n    return message",
    hasBug: true,
    tests: [{ call: "greet('Mina')", expected: "Hello, Mina" }, { call: "greet('Kai')", expected: "Hello, Kai" }]
  },
  {
    id: "l1-06",
    level: 1,
    title: "Last Item",
    task: "Return the last item in a list.",
    starterCode: "def last_item(items):\n    return items[0]",
    hasBug: true,
    tests: [{ call: "last_item([1, 2, 3])", expected: 3 }, { call: "last_item(['x'])", expected: "x" }]
  },
  {
    id: "l1-07",
    level: 1,
    title: "Make Negative",
    task: "Return the negative version of a positive number.",
    starterCode: "def make_negative(n):\n    return n",
    hasBug: true,
    tests: [{ call: "make_negative(5)", expected: -5 }, { call: "make_negative(1)", expected: -1 }]
  },
  {
    id: "l1-08",
    level: 1,
    title: "Length",
    task: "Return the length of a list.",
    starterCode: "def list_length(items):\n    len(items)",
    hasBug: true,
    tests: [{ call: "list_length([1, 2])", expected: 2 }, { call: "list_length([])", expected: 0 }]
  },
  {
    id: "l1-09",
    level: 1,
    title: "Bigger",
    task: "Return the larger of two numbers.",
    starterCode: "def bigger(a, b):\n    if a > b:\n        return b\n    return a",
    hasBug: true,
    tests: [{ call: "bigger(4, 9)", expected: 9 }, { call: "bigger(8, 2)", expected: 8 }]
  },
  {
    id: "l1-10",
    level: 1,
    title: "Square",
    task: "Return a number multiplied by itself.",
    starterCode: "def square(n):\n    return n * 2",
    hasBug: true,
    tests: [{ call: "square(5)", expected: 25 }, { call: "square(-3)", expected: 9 }]
  },
  {
    id: "l1-11",
    level: 1,
    title: "Starts With A",
    task: "Return True if the word starts with the letter a.",
    starterCode: "def starts_with_a(word):\n    return word[1].lower() == 'a'",
    hasBug: true,
    tests: [{ call: "starts_with_a('apple')", expected: true }, { call: "starts_with_a('Pear')", expected: false }]
  },
  {
    id: "l1-12",
    level: 1,
    title: "Add One",
    task: "Return the input plus one.",
    starterCode: "def add_one(n):\n    result = n - 1\n    return result",
    hasBug: true,
    tests: [{ call: "add_one(4)", expected: 5 }, { call: "add_one(-1)", expected: 0 }]
  },
  {
    id: "l1-13",
    level: 1,
    title: "Contains Zero",
    task: "Return True if zero is in the list.",
    starterCode: "def contains_zero(nums):\n    return 1 in nums",
    hasBug: true,
    tests: [{ call: "contains_zero([3, 0, 4])", expected: true }, { call: "contains_zero([1, 2])", expected: false }]
  },
  {
    id: "l1-14",
    level: 1,
    title: "Repeat Word",
    task: "Return the word repeated twice.",
    starterCode: "def repeat_twice(word):\n    return word + 'twice'",
    hasBug: true,
    tests: [{ call: "repeat_twice('ha')", expected: "haha" }, { call: "repeat_twice('go')", expected: "gogo" }]
  },
  {
    id: "l1-15",
    level: 1,
    title: "Absolute Value",
    task: "Return the absolute value of a number.",
    starterCode: "def absolute(n):\n    if n < 0:\n        return n\n    return n",
    hasBug: true,
    tests: [{ call: "absolute(-8)", expected: 8 }, { call: "absolute(3)", expected: 3 }]
  },
  {
    id: "l1-16",
    level: 1,
    title: "Empty Check",
    task: "Return True if the list is empty.",
    starterCode: "def is_empty(items):\n    return len(items) > 0",
    hasBug: true,
    tests: [{ call: "is_empty([])", expected: true }, { call: "is_empty([1])", expected: false }]
  },
  {
    id: "l1-17",
    level: 1,
    title: "Join Names",
    task: "Return first and last name separated by a space.",
    starterCode: "def full_name(first, last):\n    return first + last",
    hasBug: true,
    tests: [{ call: "full_name('Ada', 'Lovelace')", expected: "Ada Lovelace" }, { call: "full_name('Grace', 'Hopper')", expected: "Grace Hopper" }]
  },
  {
    id: "l1-18",
    level: 1,
    title: "Minimum",
    task: "Return the smaller of two numbers.",
    starterCode: "def minimum(a, b):\n    if a < b:\n        return b\n    return a",
    hasBug: true,
    tests: [{ call: "minimum(4, 9)", expected: 4 }, { call: "minimum(-2, 5)", expected: -2 }]
  },
  {
    id: "l1-19",
    level: 1,
    title: "Tail",
    task: "Return everything except the first list item.",
    starterCode: "def tail(items):\n    return items[:1]",
    hasBug: true,
    tests: [{ call: "tail([1, 2, 3])", expected: [2, 3] }, { call: "tail(['a'])", expected: [] }]
  },
  {
    id: "l1-20",
    level: 1,
    title: "Positive",
    task: "Return True when n is greater than zero.",
    starterCode: "def is_positive(n):\n    return n >= 0",
    hasBug: true,
    tests: [{ call: "is_positive(1)", expected: true }, { call: "is_positive(0)", expected: false }, { call: "is_positive(-1)", expected: false }]
  },
  {
    id: "l2-01",
    level: 2,
    title: "Count Evens",
    task: "Count how many numbers in the list are even.",
    starterCode: "def count_evens(nums):\n    count = 0\n    for n in nums:\n        if n % 2 == 1:\n            count += 1\n    return count",
    hasBug: true,
    tests: [{ call: "count_evens([1, 2, 4, 5])", expected: 2 }, { call: "count_evens([7, 9])", expected: 0 }, { call: "count_evens([])", expected: 0 }]
  },
  {
    id: "l2-02",
    level: 2,
    title: "Only Positives",
    task: "Return a new list containing only positive numbers.",
    starterCode: "def only_positives(nums):\n    result = []\n    for n in nums:\n        if n < 0:\n            result.append(n)\n    return result",
    hasBug: true,
    tests: [{ call: "only_positives([-1, 0, 3, 5])", expected: [3, 5] }, { call: "only_positives([-2])", expected: [] }]
  },
  {
    id: "l2-03",
    level: 2,
    title: "Find Index",
    task: "Return the index of target, or -1 if it is missing.",
    starterCode: "def find_index(items, target):\n    for i in range(1, len(items)):\n        if items[i] == target:\n            return i\n    return -1",
    hasBug: true,
    tests: [{ call: "find_index(['a', 'b'], 'a')", expected: 0 }, { call: "find_index([4, 5, 6], 6)", expected: 2 }, { call: "find_index([1], 2)", expected: -1 }]
  },
  {
    id: "l2-04",
    level: 2,
    title: "Clamp",
    task: "Clamp a number between low and high.",
    starterCode: "def clamp(n, low, high):\n    if n < low:\n        return high\n    if n > high:\n        return low\n    return n",
    hasBug: true,
    tests: [{ call: "clamp(5, 1, 10)", expected: 5 }, { call: "clamp(-2, 0, 8)", expected: 0 }, { call: "clamp(12, 0, 8)", expected: 8 }]
  },
  {
    id: "l2-05",
    level: 2,
    title: "Average",
    task: "Return the average of a non-empty list of numbers.",
    starterCode: "def average(nums):\n    total = 0\n    for n in nums:\n        total += n\n    return total",
    hasBug: true,
    tests: [{ call: "average([2, 4, 6])", expected: 4 }, { call: "average([10])", expected: 10 }]
  },
  {
    id: "l2-06",
    level: 2,
    title: "Reverse String",
    task: "Return a reversed copy of the string.",
    starterCode: "def reverse_text(text):\n    result = ''\n    for ch in text:\n        result = result + ch\n    return result",
    hasBug: true,
    tests: [{ call: "reverse_text('abc')", expected: "cba" }, { call: "reverse_text('')", expected: "" }]
  },
  {
    id: "l2-07",
    level: 2,
    title: "Has Duplicate",
    task: "Return True if any item appears more than once.",
    starterCode: "def has_duplicate(items):\n    seen = set()\n    for item in items:\n        if item not in seen:\n            return True\n        seen.add(item)\n    return False",
    hasBug: true,
    tests: [{ call: "has_duplicate([1, 2, 1])", expected: true }, { call: "has_duplicate(['a', 'b'])", expected: false }]
  },
  {
    id: "l2-08",
    level: 2,
    title: "Fizz Count",
    task: "Count numbers from 1 through n that are divisible by 3.",
    starterCode: "def fizz_count(n):\n    count = 0\n    for x in range(1, n):\n        if x % 3 == 0:\n            count += 1\n    return count",
    hasBug: true,
    tests: [{ call: "fizz_count(3)", expected: 1 }, { call: "fizz_count(10)", expected: 3 }]
  },
  {
    id: "l2-09",
    level: 2,
    title: "Remove None",
    task: "Return a list with all None values removed.",
    starterCode: "def remove_none(items):\n    result = []\n    for item in items:\n        if item == None:\n            result.append(item)\n    return result",
    hasBug: true,
    tests: [{ call: "remove_none([1, None, 2])", expected: [1, 2] }, { call: "remove_none([None])", expected: [] }]
  },
  {
    id: "l2-10",
    level: 2,
    title: "Word Lengths",
    task: "Return a list containing the length of each word.",
    starterCode: "def word_lengths(words):\n    lengths = []\n    for word in words:\n        lengths.append(word)\n    return lengths",
    hasBug: true,
    tests: [{ call: "word_lengths(['hi', 'code'])", expected: [2, 4] }, { call: "word_lengths([])", expected: [] }]
  },
  {
    id: "l2-11",
    level: 2,
    title: "Sum Until Zero",
    task: "Sum values until the first zero appears.",
    starterCode: "def sum_until_zero(nums):\n    total = 0\n    for n in nums:\n        if n == 0:\n            total += n\n        else:\n            total += n\n    return total",
    hasBug: true,
    tests: [{ call: "sum_until_zero([2, 3, 0, 9])", expected: 5 }, { call: "sum_until_zero([1, 2])", expected: 3 }]
  },
  {
    id: "l2-12",
    level: 2,
    title: "Capitalize All",
    task: "Return every word with its first letter capitalized.",
    starterCode: "def capitalize_all(words):\n    result = []\n    for word in words:\n        result.append(word.lower())\n    return result",
    hasBug: true,
    tests: [{ call: "capitalize_all(['ada', 'BOB'])", expected: ["Ada", "Bob"] }, { call: "capitalize_all([])", expected: [] }]
  },
  {
    id: "l2-13",
    level: 2,
    title: "Every Other",
    task: "Return every other item starting with the first.",
    starterCode: "def every_other(items):\n    result = []\n    for i in range(1, len(items), 2):\n        result.append(items[i])\n    return result",
    hasBug: true,
    tests: [{ call: "every_other([1, 2, 3, 4])", expected: [1, 3] }, { call: "every_other(['x'])", expected: ["x"] }]
  },
  {
    id: "l2-14",
    level: 2,
    title: "Password OK",
    task: "Return True if a password has at least 8 characters and a digit.",
    starterCode: "def password_ok(password):\n    has_digit = False\n    for ch in password:\n        if ch.isdigit():\n            has_digit = True\n    return len(password) > 8 and has_digit",
    hasBug: true,
    tests: [{ call: "password_ok('abc12345')", expected: true }, { call: "password_ok('abc1234')", expected: false }, { call: "password_ok('abcdefgh')", expected: false }]
  },
  {
    id: "l2-15",
    level: 2,
    title: "Merge Sorted",
    task: "Return one sorted list made from two already sorted lists.",
    starterCode: "def merge_sorted(a, b):\n    result = a + b\n    return result",
    hasBug: true,
    tests: [{ call: "merge_sorted([1, 3], [2, 4])", expected: [1, 2, 3, 4] }, { call: "merge_sorted([], [2])", expected: [2] }]
  },
  {
    id: "l2-16",
    level: 2,
    title: "Count Vowels",
    task: "Count vowels in a string.",
    starterCode: "def count_vowels(text):\n    count = 0\n    for ch in text.lower():\n        if ch in 'aeio':\n            count += 1\n    return count",
    hasBug: true,
    tests: [{ call: "count_vowels('audio')", expected: 4 }, { call: "count_vowels('sky')", expected: 0 }]
  },
  {
    id: "l2-17",
    level: 2,
    title: "Drop Short",
    task: "Return words whose length is at least min_len.",
    starterCode: "def drop_short(words, min_len):\n    kept = []\n    for word in words:\n        if len(word) <= min_len:\n            kept.append(word)\n    return kept",
    hasBug: true,
    tests: [{ call: "drop_short(['a', 'code', 'sun'], 3)", expected: ["code", "sun"] }, { call: "drop_short(['hi'], 3)", expected: [] }]
  },
  {
    id: "l2-18",
    level: 2,
    title: "Running Total",
    task: "Return a list of running totals.",
    starterCode: "def running_total(nums):\n    total = 0\n    result = []\n    for n in nums:\n        result.append(total)\n        total += n\n    return result",
    hasBug: true,
    tests: [{ call: "running_total([2, 3, 4])", expected: [2, 5, 9] }, { call: "running_total([])", expected: [] }]
  },
  {
    id: "l2-19",
    level: 2,
    title: "In Range",
    task: "Return True if n is between low and high, inclusive.",
    starterCode: "def in_range(n, low, high):\n    return n > low and n < high",
    hasBug: true,
    tests: [{ call: "in_range(5, 5, 8)", expected: true }, { call: "in_range(8, 5, 8)", expected: true }, { call: "in_range(9, 5, 8)", expected: false }]
  },
  {
    id: "l2-20",
    level: 2,
    title: "No Change",
    task: "This function is already correct. Leave it working.",
    starterCode: "def total_chars(words):\n    total = 0\n    for word in words:\n        total += len(word)\n    return total",
    hasBug: false,
    tests: [{ call: "total_chars(['ab', 'c'])", expected: 3 }, { call: "total_chars([])", expected: 0 }]
  },
  {
    id: "l3-01",
    level: 3,
    title: "Balanced Score",
    task: "Sum positives and negatives separately, then return positives minus absolute negatives.",
    starterCode: "def balanced_score(nums):\n    positives = 0\n    negatives = 0\n    for n in nums:\n        if n >= 0:\n            positives += n\n        else:\n            positives += n\n    return positives + negatives",
    hasBug: true,
    tests: [{ call: "balanced_score([5, -2, 3])", expected: 6 }, { call: "balanced_score([-4, -1])", expected: -5 }, { call: "balanced_score([])", expected: 0 }]
  },
  {
    id: "l3-02",
    level: 3,
    title: "Normalize Names",
    task: "Trim names, ignore empty entries, and title-case the rest.",
    starterCode: "def normalize_names(names):\n    clean = []\n    for name in names:\n        name = name.strip()\n        if name == '':\n            clean.append(name)\n        else:\n            clean.append(name.lower())\n    return clean",
    hasBug: true,
    tests: [{ call: "normalize_names([' ada ', '', 'BOB'])", expected: ["Ada", "Bob"] }, { call: "normalize_names(['  kai'])", expected: ["Kai"] }]
  },
  {
    id: "l3-03",
    level: 3,
    title: "Chunk Pairs",
    task: "Return a list of two-item chunks; the final chunk may have one item.",
    starterCode: "def chunk_pairs(items):\n    chunks = []\n    for i in range(0, len(items) - 1, 2):\n        chunks.append(items[i:i+1])\n    return chunks",
    hasBug: true,
    tests: [{ call: "chunk_pairs([1, 2, 3, 4, 5])", expected: [[1, 2], [3, 4], [5]] }, { call: "chunk_pairs([])", expected: [] }]
  },
  {
    id: "l3-04",
    level: 3,
    title: "Inventory Value",
    task: "Return total price * quantity for all inventory rows.",
    starterCode: "def inventory_value(rows):\n    total = 0\n    for row in rows:\n        price = row['price']\n        qty = row['qty']\n        total += price + qty\n    return total",
    hasBug: true,
    tests: [{ call: "inventory_value([{'price': 3, 'qty': 4}, {'price': 2, 'qty': 5}])", expected: 22 }, { call: "inventory_value([])", expected: 0 }]
  },
  {
    id: "l3-05",
    level: 3,
    title: "Unique Sorted",
    task: "Return unique values sorted from smallest to largest.",
    starterCode: "def unique_sorted(nums):\n    result = []\n    for n in nums:\n        if n in result:\n            result.append(n)\n    return result.sort()",
    hasBug: true,
    tests: [{ call: "unique_sorted([3, 1, 3, 2])", expected: [1, 2, 3] }, { call: "unique_sorted([])", expected: [] }]
  },
  {
    id: "l3-06",
    level: 3,
    title: "Grade Summary",
    task: "Return a dict with pass and fail counts; scores 60 and above pass.",
    starterCode: "def grade_summary(scores):\n    summary = {'pass': 0, 'fail': 0}\n    for score in scores:\n        if score > 60:\n            summary['pass'] += 1\n        else:\n            summary['pass'] += 1\n    return summary",
    hasBug: true,
    tests: [{ call: "grade_summary([60, 59, 80])", expected: { pass: 2, fail: 1 } }, { call: "grade_summary([])", expected: { pass: 0, fail: 0 } }]
  },
  {
    id: "l3-07",
    level: 3,
    title: "Flatten Once",
    task: "Flatten one level of nested lists.",
    starterCode: "def flatten_once(groups):\n    result = []\n    for group in groups:\n        result.append(group)\n    return result",
    hasBug: true,
    tests: [{ call: "flatten_once([[1, 2], [], [3]])", expected: [1, 2, 3] }, { call: "flatten_once([])", expected: [] }]
  },
  {
    id: "l3-08",
    level: 3,
    title: "Best Student",
    task: "Return the name with the highest score, or None for no students.",
    starterCode: "def best_student(scores):\n    best_name = ''\n    best_score = 0\n    for name, score in scores.items():\n        if score < best_score:\n            best_name = name\n            best_score = score\n    return best_name",
    hasBug: true,
    tests: [{ call: "best_student({'Ava': 91, 'Bo': 88})", expected: "Ava" }, { call: "best_student({'Zed': -1})", expected: "Zed" }, { call: "best_student({})", expected: null }]
  },
  {
    id: "l3-09",
    level: 3,
    title: "Compress Spaces",
    task: "Collapse repeated spaces into single spaces and trim the result.",
    starterCode: "def compress_spaces(text):\n    pieces = text.split(' ')\n    return ' '.join(pieces)",
    hasBug: true,
    tests: [{ call: "compress_spaces('  hello   world ')", expected: "hello world" }, { call: "compress_spaces('ok')", expected: "ok" }]
  },
  {
    id: "l3-10",
    level: 3,
    title: "Rotate Left",
    task: "Rotate a list left by k places.",
    starterCode: "def rotate_left(items, k):\n    if len(items) == 0:\n        return []\n    k = k\n    return items[k:] + items[:k]",
    hasBug: true,
    tests: [{ call: "rotate_left([1, 2, 3, 4], 1)", expected: [2, 3, 4, 1] }, { call: "rotate_left([1, 2, 3], 5)", expected: [3, 1, 2] }]
  },
  {
    id: "l3-11",
    level: 3,
    title: "No Bug Map",
    task: "This function is already correct. Return a dict mapping words to lengths.",
    starterCode: "def word_map(words):\n    result = {}\n    for word in words:\n        result[word] = len(word)\n    return result",
    hasBug: false,
    tests: [{ call: "word_map(['hi', 'code'])", expected: { hi: 2, code: 4 } }, { call: "word_map([])", expected: {} }]
  },
  {
    id: "l3-12",
    level: 3,
    title: "Median",
    task: "Return the median of a non-empty list.",
    starterCode: "def median(nums):\n    ordered = nums\n    ordered.sort()\n    mid = len(nums) // 2\n    if len(nums) % 2 == 0:\n        return ordered[mid]\n    return (ordered[mid - 1] + ordered[mid]) / 2",
    hasBug: true,
    tests: [{ call: "median([3, 1, 2])", expected: 2 }, { call: "median([4, 1, 2, 3])", expected: 2.5 }]
  },
  {
    id: "l3-13",
    level: 3,
    title: "Safe Divide",
    task: "Return a / b, or None when b is zero.",
    starterCode: "def safe_divide(a, b):\n    if b == 0:\n        return 0\n    result = a // b\n    return result",
    hasBug: true,
    tests: [{ call: "safe_divide(5, 2)", expected: 2.5 }, { call: "safe_divide(5, 0)", expected: null }]
  },
  {
    id: "l3-14",
    level: 3,
    title: "Tag Counts",
    task: "Count lowercase tags from a list, ignoring blanks.",
    starterCode: "def tag_counts(tags):\n    counts = {}\n    for tag in tags:\n        key = tag.strip()\n        if key == '':\n            counts[key] = counts.get(key, 0) + 1\n        else:\n            counts[tag] = counts.get(tag, 0) + 1\n    return counts",
    hasBug: true,
    tests: [{ call: "tag_counts([' Bug ', 'bug', ''])", expected: { bug: 2 } }, { call: "tag_counts([])", expected: {} }]
  },
  {
    id: "l3-15",
    level: 3,
    title: "Second Largest",
    task: "Return the second largest unique number, or None if it does not exist.",
    starterCode: "def second_largest(nums):\n    ordered = sorted(nums)\n    if len(ordered) < 2:\n        return None\n    return ordered[-2]",
    hasBug: true,
    tests: [{ call: "second_largest([5, 5, 4, 3])", expected: 4 }, { call: "second_largest([1])", expected: null }, { call: "second_largest([2, 2])", expected: null }]
  },
  {
    id: "l3-16",
    level: 3,
    title: "No Bug Filter",
    task: "This function is already correct. Keep strings that contain the query.",
    starterCode: "def filter_contains(items, query):\n    result = []\n    for item in items:\n        if query in item:\n            result.append(item)\n    return result",
    hasBug: false,
    tests: [{ call: "filter_contains(['alpha', 'beta', 'atlas'], 'a')", expected: ["alpha", "beta", "atlas"] }, { call: "filter_contains(['sun'], 'z')", expected: [] }]
  },
  {
    id: "l3-17",
    level: 3,
    title: "Pair Sums",
    task: "Return sums of neighboring pairs.",
    starterCode: "def pair_sums(nums):\n    sums = []\n    for i in range(len(nums)):\n        sums.append(nums[i] + nums[i + 1])\n    return sums",
    hasBug: true,
    tests: [{ call: "pair_sums([1, 2, 3, 4])", expected: [3, 5, 7] }, { call: "pair_sums([1])", expected: [] }]
  },
  {
    id: "l3-18",
    level: 3,
    title: "Mode Value",
    task: "Return the most frequent value; ties return the first value that reached the top count.",
    starterCode: "def mode_value(items):\n    counts = {}\n    best = None\n    best_count = 0\n    for item in items:\n        counts[item] = counts.get(item, 0) + 1\n        if counts[item] >= best_count:\n            best = item\n            best_count = counts[item]\n    return best",
    hasBug: true,
    tests: [{ call: "mode_value(['a', 'b', 'a', 'b'])", expected: "a" }, { call: "mode_value([])", expected: null }]
  },
  {
    id: "l3-19",
    level: 3,
    title: "Parse Scores",
    task: "Convert numeric strings to ints and ignore invalid values.",
    starterCode: "def parse_scores(values):\n    scores = []\n    for value in values:\n        if value.isdigit():\n            scores.append(value)\n    return scores",
    hasBug: true,
    tests: [{ call: "parse_scores(['10', 'x', '03'])", expected: [10, 3] }, { call: "parse_scores(['-1', '2'])", expected: [2] }]
  },
  {
    id: "l1-21",
    level: 1,
    title: "Triple It",
    task: "Return triple the input number.",
    starterCode: "def triple(n):\n    return n * 2",
    hasBug: true,
    tests: [{ call: "triple(3)", expected: 9 }, { call: "triple(-2)", expected: -6 }, { call: "triple(0)", expected: 0 }]
  },
  {
    id: "l1-22",
    level: 1,
    title: "Subtract One",
    task: "Return the input minus one.",
    starterCode: "def subtract_one(n):\n    return n + 1",
    hasBug: true,
    tests: [{ call: "subtract_one(5)", expected: 4 }, { call: "subtract_one(0)", expected: -1 }]
  },
  {
    id: "l1-23",
    level: 1,
    title: "Is Odd",
    task: "Return True when a number is odd.",
    starterCode: "def is_odd(n):\n    return n % 2 == 0",
    hasBug: true,
    tests: [{ call: "is_odd(3)", expected: true }, { call: "is_odd(8)", expected: false }, { call: "is_odd(-1)", expected: true }]
  },
  {
    id: "l1-24",
    level: 1,
    title: "Make Positive",
    task: "Return the absolute value of n.",
    starterCode: "def make_positive(n):\n    return n",
    hasBug: true,
    tests: [{ call: "make_positive(-12)", expected: 12 }, { call: "make_positive(5)", expected: 5 }]
  },
  {
    id: "l1-25",
    level: 1,
    title: "Concatenate",
    task: "Join two strings together without any spacing.",
    starterCode: "def concat_words(a, b):\n    return a + ' ' + b",
    hasBug: true,
    tests: [{ call: "concat_words('hot', 'dog')", expected: "hotdog" }, { call: "concat_words('', 'code')", expected: "code" }]
  },
  {
    id: "l2-21",
    level: 2,
    title: "Count Odds",
    task: "Count how many odd numbers are in the list.",
    starterCode: "def count_odds(nums):\n    count = 0\n    for n in nums:\n        if n % 2 == 0:\n            count += 1\n    return count",
    hasBug: true,
    tests: [{ call: "count_odds([1, 2, 3, 4, 5])", expected: 3 }, { call: "count_odds([2, 4, 6])", expected: 0 }, { call: "count_odds([])", expected: 0 }]
  },
  {
    id: "l2-22",
    level: 2,
    title: "Find Minimum",
    task: "Return the smallest number in a non-empty list.",
    starterCode: "def find_min(nums):\n    lowest = 0\n    for n in nums:\n      if n < lowest:\n        lowest = n\n    return lowest",
    hasBug: true,
    tests: [{ call: "find_min([4, 2, 9, 5])", expected: 2 }, { call: "find_min([-5, -2, -9])", expected: -9 }]
  },
  {
    id: "l2-23",
    level: 2,
    title: "String Lengths",
    task: "Given a list of words, return a list of their lengths.",
    starterCode: "def lengths_list(words):\n    res = []\n    for w in words:\n        res.append(w)\n    return res",
    hasBug: true,
    tests: [{ call: "lengths_list(['apple', 'pi'])", expected: [5, 2] }, { call: "lengths_list([])", expected: [] }]
  },
  {
    id: "l2-24",
    level: 2,
    title: "Is Palindrome",
    task: "Return True if word reads the same backward as forward.",
    starterCode: "def is_palindrome(word):\n    return word == word[1:]",
    hasBug: true,
    tests: [{ call: "is_palindrome('radar')", expected: true }, { call: "is_palindrome('code')", expected: false }, { call: "is_palindrome('')", expected: true }]
  },
  {
    id: "l2-25",
    level: 2,
    title: "Multiply All",
    task: "Return the product of all numbers in the list. Returns 1 for empty lists.",
    starterCode: "def product(nums):\n    total = 0\n    for n in nums:\n        total *= n\n    return total",
    hasBug: true,
    tests: [{ call: "product([2, 3, 4])", expected: 24 }, { call: "product([])", expected: 1 }, { call: "product([-2, 5])", expected: -10 }]
  },
  {
    id: "l3-21",
    level: 3,
    title: "Count Words",
    task: "Return a dictionary counting occurrences of each word in the list.",
    starterCode: "def count_occurrences(words):\n    counts = {}\n    for w in words:\n        counts[w] = 1\n    return counts",
    hasBug: true,
    tests: [{ call: "count_occurrences(['a', 'b', 'a'])", expected: {"a": 2, "b": 1} }, { call: "count_occurrences([])", expected: {} }]
  },
  {
    id: "l3-22",
    level: 3,
    title: "Unique Sorted",
    task: "Return unique values in a list sorted from smallest to largest.",
    starterCode: "def sorted_uniques(nums):\n    return sorted(nums)",
    hasBug: true,
    tests: [{ call: "sorted_uniques([4, 1, 4, 2])", expected: [1, 2, 4] }, { call: "sorted_uniques([])", expected: [] }]
  },
  {
    id: "l3-23",
    level: 3,
    title: "Filter Primes",
    task: "Return a new list containing only the prime numbers from the input list.",
    starterCode: "def filter_primes(nums):\n    def is_prime(x):\n        return x > 1\n    return [n for n in nums if is_prime(n)]",
    hasBug: true,
    tests: [{ call: "filter_primes([2, 3, 4, 5, 6, 7])", expected: [2, 3, 5, 7] }, { call: "filter_primes([0, 1, 9, 15])", expected: [] }]
  },
  {
    id: "l3-24",
    level: 3,
    title: "Parity Grouping",
    task: "Separate numbers into keys 'even' and 'odd' in a dictionary.",
    starterCode: "def group_parity(nums):\n    res = {'even': [], 'odd': []}\n    for n in nums:\n        if n % 2 == 0:\n            res['odd'].append(n)\n        else:\n            res['even'].append(n)\n    return res",
    hasBug: true,
    tests: [{ call: "group_parity([1, 2, 3])", expected: {"even": [2], "odd": [1, 3]} }, { call: "group_parity([])", expected: {"even": [], "odd": []} }]
  },
  {
    id: "l3-25",
    level: 3,
    title: "Caesar Shift",
    task: "Shift all alphabet letters forward by 1 character (assume lowercase letters only).",
    starterCode: "def shift_chars(text):\n    res = ''\n    for c in text:\n        res += chr(ord(c) + 2)\n    return res",
    hasBug: true,
    tests: [{ call: "shift_chars('abc')", expected: "bcd" }, { call: "shift_chars('xyz')", expected: "yza" }]
  }
];

export function snippetsForLevel(level: 1 | 2 | 3) {
  return codeSnippets.filter((snippet) => snippet.level === level);
}

export async function fetchOnlineSnippets() {
  try {
    const res = await fetch("https://raw.githubusercontent.com/rehan-pmf/coding-challenges/main/extra_snippets.json");
    if (!res.ok) return;
    const extra = await res.json();
    if (Array.isArray(extra)) {
      const existingIds = new Set(codeSnippets.map(s => s.id));
      const uniqueExtras = extra.filter((s: any) => s.id && !existingIds.has(s.id));
      codeSnippets.push(...uniqueExtras);
      console.log(`Loaded ${uniqueExtras.length} custom Python challenges from the internet!`);
    }
  } catch (err) {
    // Fail silently, using local offline challenges database
    console.warn("Failed to fetch online Python challenges. Using offline data.", err);
  }
}
