var $RESULT = $('#result-list');
var $TEXT = $('#text');
var $TOTAL = $('#total');
var $RESULT_CONTAINER = $('#result');
var $FORM_SEARCH = $('#form');
var $FAV = $('#fav');
var $SEARCH_MAX = $('#limit');
var $SEARCH_TYPE = $('#search-type');
var $SEARCH_SPACES = $('#search-spaces');
var $SEARCH_FILTER = $('#search-filter');
var _used; // Used result combinations
var _valid;
var _permArr;
var _usedChars;
var _anagrams;
var _favorites = {};
var _searchLimit;
var _searchType = $SEARCH_TYPE.val();

$FORM_SEARCH.submit(function (e) {
  e.preventDefault();
  var text = $TEXT.val().toLowerCase();
  _permArr = [],
  _usedChars = [];
  $RESULT.html('');
  _searchLimit = parseInt($SEARCH_MAX.val(), 10);
  _searchType = $SEARCH_TYPE.val();
  
  if ($SEARCH_SPACES.is(':checked')) text = text.replace(/ /g, '');
    
  if (_searchType === 'random') {
    _anagrams = mixString(text);
  } else if (_searchType === 'alphabetical') {
    // Split text into text and prefix
    var filter = getFilter(text); 
    for (var i = 0, len = filter.length; i < len; i++) {
      text = text.replace(filter[i], '');
    }
    _anagrams = permute(text.split(''), filter);
  }
  
  for (var i = 0, len = _anagrams.length; i < len; i++) {
    addAnagram(_anagrams[i]);
  }
  
  updateTotal(_anagrams.length);
  
  $RESULT_CONTAINER.show();
});

function getFilter (text) {
  var test = text;
  
  if ($SEARCH_SPACES.is(':checked')) {
    var result = $SEARCH_FILTER.val().replace(/ /g, '').toLowerCase();
  } else {
      var result = $SEARCH_FILTER.val().toLowerCase();
  }
  
  for (var i = 0, len = result.length; i < len; i++) {
    // Check if the letter is present
    if (test.indexOf(result[i]) !== -1) {
      test = test.replace(result[i]);
    } else {
      result = '';
      break;
    }
    // If so remove and update test
    // Otherwise test failed and result = ''
  }
  // @TODO Verify each letter is present
  //console.log(text, result);
  //if (text.indexOf(result) === -1) result = ''; 
  
  return result;
}

// @TODO Kind of a hack, could be written much better
function mixString (text) {
  var blacklist = {}, // Previously hit items
      results = [],
      test,
      filter = getFilter(text); // Successful item matches
  
  // Strip the filter down to make sure it lines up with the text
  
  // For each letter in filter loop through the text and remove it
  for (var i = 0, len = filter.length; i < len; i++) {
    text = text.replace(filter[i], '');
  }
    
  text = text.split('');
  
  // Loop through and try combinations until result limit is hit
  for (var i = 0, len = _searchLimit; i < len; i++) {
    test = shuffle(text).join('');
    if (!blacklist[test]) {
      blacklist[test] = true;
      results.push(filter + test);
    }
  }
  
  return results;
}

var fav = {
  add: function (text) {
    if (!_favorites[text]) {
      _favorites[text] = true;
      $('<li class="fav" id="fav-' + text + '">' + text + '</li>').click(function () {
        fav.remove($(this).html());
      }).appendTo($FAV);
    }
  },
  
  remove: function (text) {
    if (_favorites[text]) {
      _favorites[text] = false;
      $('#fav-' + text).detach();
    }
  }
};

function addAnagram(text) {
  $('<li>' + text + '</li>').click(function () {
    $(this).addClass('fav');
    fav.add(text);
  }).appendTo($RESULT); 
}

function updateTotal (num) {
  $TOTAL.html(num);
  _anagrams.length > 0 ? $TOTAL.parent().show() : $TOTAL.parent().hide();
}

// @src http://stackoverflow.com/questions/9960908/permutations-in-javascript
function permute (input, prefix) {
    var i, ch;
  
  // Check if our max limit has been reached
  if (_permArr.length >= _searchLimit) return;
  
  // Loop through every letter
    for (i = 0; i < input.length; i++) {
      // Splice the character at the index we need
        ch = input.splice(i, 1)[0];
      
      // Push the character into the used category
        _usedChars.push(ch);
      
      // We've run out of characters, push this combination into storage
        if (input.length == 0) {
            _permArr.push(prefix + _usedChars.slice().join(''));
        }
      
      // Recursively run the input without the characters we've removed
        permute(input, prefix);
      
      // Inject and shift our stored letter at the appropriate index, this is how arrange for all possible combinations
        input.splice(i, 0, ch);
      
      // Remove the last used character as we've exhausted its potential
        _usedChars.pop();
    }
    return _permArr.sort();
};

function shuffle (array) {
  var currentIndex = array.length, 
      temporaryValue, 
      randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

$('#warning-btn').click(function () {
  $(this).hide();
  $('#warning').hide();
});

$('#gallery-block').click(function () { $RESULT.addClass('block').removeClass('list');  });
$('#gallery-list').click(function () { $RESULT.addClass('list').removeClass('block');  });

$FORM_SEARCH.submit();