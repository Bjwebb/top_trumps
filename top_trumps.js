/**
 * @file
 */

/**
 * 
 */
(function($) {
  var topTrumpsMethods = {
    'prepareSettings' : function(options) {
      var settings = $.extend({
        // easy, normal, hard (default: normal)
        'difficulty' : 'normal',
        
        // ignore, requeue
        'trick' : 'ignore',

        // An array of fields used for comparison.
        // Each field should be an object defined as follows.
        //   name : Some name that can be shown to the user.
        //   classes : A custom class that should be added to this field. (optional)
        //   prefix : A prefix that should be prepended to the field value. (optional)
        //   suffix : A suffix that should be appended to the field value. (optional)
        //   comparison : '>', '<' Defines what value would be better when comparing to cards.
        //
        //   ... (add whatever variable you need, you can access them in the render functions.
        'fields' : [],

        // An array of cards with values as defined above.
        // Cards will be shuffled and divided between user and NPC.
        // Each card is an object.
        //   name : Human readable name of this card.
        //   fields : An array of fields as defined above. Just define the field values.
        //
        //   ... (add whatever variable you need, you can access them in the render functions.
        'cards' : [],

        // Will be called after top trumps has been build.
        'onInit' : function() { },
        
        // Will be called after cards have been compared.
        'onCompared' : function() { },
        
        // Will be called when game ends.
        'onComplete' : function() { }
      }, options);
      
      // Prepare players.
      settings.players = ['user', 'cpu'];
      
      // Validate & prepare comparison fields.
      settings.fields = topTrumpsMethods.prepareFields(settings.fields);
      
      // Validate & prepare game cards.
      settings.cards = topTrumpsMethods.prepareCards(settings.cards, settings.fields);
      
      // Prepare trumps, this is useful during gameplay.
      // Also the cpu uses trumps to chose the best field.
      settings.trumps = topTrumpsMethods.prepareTrumps(settings.cards, settings.fields);
      
      // Prepare stacks for both players.
      settings.stacks = topTrumpsMethods.prepareStacks(settings.cards, settings.players);
      
      // Prepare points array.
      settings.points = {'user' : 0, 'cpu' : 0};
      
      // Define which player should start the game.
      settings.beginner = 0;
      if (settings.difficulty == 'hard') {
        settings.beginner = 1;
      }
      
      // Define the requeue array, this will be used for trick cards.
      settings.requeued = {'cpu' : [], 'user' : []};
      
      return settings;
    },
    
    'shuffleCards' : function(cards) {
      var i = cards.length;

      if (i == 0) {
        return false;
      }

      while (--i) {
        var j = Math.floor(Math.random() * (i + 1));
        var tempi = cards[i];
        var tempj = cards[j];
        cards[i] = tempj;
        cards[j] = tempi;
      }

      return cards;
    },
    
    'prepareFields' : function(fields) {
      var validFields = [];
      for (var i = 0; i < fields.length; i++) {
        if (typeof fields[i].name == 'undefined' || typeof fields[i].comparison == 'undefined') {
          continue;
        }

        if (fields[i].comparison != '<' && fields[i].comparison != '>') {
          continue;
        }

        validFields.push(fields[i]);
      }
      
      return validFields;
    },
    
    'prepareCards' : function(cards, fields) {
      var validCards = [];
      for (var i = 0; i < cards.length; i++) {
        if (typeof cards[i].name == 'undefined' || typeof cards[i].fields == 'undefined') {
          continue;
        }

        if (cards[i].fields.length != fields.length) {
          continue;
        }
        
        validCards.push(cards[i]);
      }
      
      // Shuffle cards to randomize cards order.
      validCards = topTrumpsMethods.shuffleCards(validCards);
      
      return validCards;
    },
    
    'prepareTrumps' : function(cards, fields) {
      var trumps = [];
      for (var i = 0; i < cards.length; i++) {
        for (var j = 0; j < cards[i].fields.length; j++) {
          if (typeof trumps[j] == 'undefined') {
            trumps[j] = cards[i].fields[j];
          } 
          else if (fields[j].comparison == '>' && cards[i].fields[j] > trumps[j]) {
            trumps[j] = cards[i].fields[j];
          }
          else if (fields[j].comparison == '<' && cards[i].fields[j] < trumps[j]) {
            trumps[j] = cards[i].fields[j];
          }
        }
      }
      
      return trumps;
    },
    
    'prepareStacks' : function(cards, players) {
      var stacks = [];
      for (var i = 0; i < players.length; i++) {
        stacks[players[i]] = [];
      }
      
      var count = 0;
      $.each(cards, function(key, value) {
        stacks[players[count]].push(value);

        count++;
        if (count >= players.length) {
          count = 0;
        }
      });
      
      return stacks;
    },
    
    'renderGame' : function(tt, settings) {
      tt.addClass('top-trumps-wrapper');
      
      for (var i = 0; i < settings.players.length; i++) {
        topTrumpsMethods.renderCardDeck(tt, settings, settings.players[i]);
      }
      
      topTrumpsMethods.renderStartButton(tt);
    },
    
    'renderCardDeck' : function(tt, settings, player) {
      var $player = $('<div/>').addClass('top-trumps-side top-trumps-' + player);
      $('<div/>').addClass('top-trumps-card-wrapper').appendTo($player);
      $('<div/>').addClass('top-trumps-points').html('0').appendTo($player);

      if (settings.trick == 'requeue') {
        $('<div/>').addClass('top-trumps-side-requeued').appendTo($player);
      }

      $player.appendTo(tt);
    },
    
    'renderStartButton' : function(tt) {
      $overlay = $('<div/>').addClass('top-trumps-overlay');
      $('<a/>').addClass('top-trumps-start-button').html('Start Game').appendTo($overlay);
      $overlay.appendTo(tt);
      
      $('a.top-trumps-start-button', tt).click(function() {
        topTrumpsMethods.startGame(tt, tt.topTrumps);
        
        return false;
      });
    },
    
    'renderCards' : function(settings, tt) {
      var cards = settings.activeCards;
    
      $('.top-trumps-card', tt).remove();
      
      topTrumpsMethods.renderCard(cards.cpu, 'cpu', settings, tt);
      topTrumpsMethods.renderCard(cards.user, 'user', settings, tt);
      
      // Add event handler to card fields.
      if (tt.topTrumpsTurn == 'user') {
        $('.top-trumps-card-field', tt).click(function() {
          var ident = $(this).attr('id');
          var ident_arr = ident.split('-');
          
          topTrumpsMethods.compareCards(ident_arr[(ident_arr.length - 1)], tt.topTrumps, tt);
          
          return false;
        });
      }
      else {
        var field = topTrumpsMethods.selectField(tt.topTrumps, tt);
        $('#top-trumps-card-field-cpu-' + field).addClass('active');
        
        setTimeout(function() {
          topTrumpsMethods.compareCards(field, tt.topTrumps, tt);
        }, 2000);
      }
    },
    
    'renderCard' : function(card, player, settings, tt) {
      var $card = $('<div/>').addClass('top-trumps-card');
    
      if (player == tt.topTrumpsTurn || player == 'user') {
        $('<div/>').addClass('top-trumps-card-name').html(card.name).appendTo($card);
        
        var $fields = topTrumpsMethods.renderCardFields(card, settings.fields, settings.trumps, player);
        $fields.appendTo($card);
      }
      else {
        $('<div/>').addClass('top-trumps-card-name').html('?').appendTo($card);
        $card.addClass('deactivated');
      }
      
      $card.appendTo(tt.find('.top-trumps-' + player + ' .top-trumps-card-wrapper'));
    },
    
    'renderCardFields' : function(card, fields, trumps, player) {
      var $fields = $('<div/>').addClass('top-trumps-card-fields');
      
      for (var i = 0; i < fields.length; i++) {
        var $field = $('<div/>').attr('id', 'top-trumps-card-field-' + player + '-' + i).addClass('top-trumps-card-field');
        $('<span/>').addClass('top-trumps-card-field-value').html(card.fields[i]).appendTo($field);

        if (typeof fields[i].classes != 'undefined') {
          $field.addClass(fields[i].classes);
        }

        if (typeof fields[i].prefix != 'undefined') {
          $('<span/>').addClass('top-trumps-card-field-prefix').html(fields[i].prefix).prependTo($field);
        }

        if (typeof fields[i].suffix != 'undefined') {
          $('<span/>').addClass('top-trumps-card-field-suffix').html(fields[i].suffix).appendTo($field);
        }

        $('<span/>').addClass('top-trumps-card-field-name').html(fields[i].name).prependTo($field);
        
        // Mark this field as a trump.
        if (card.fields[i] == trumps[i]) {
          $field.addClass('top-trump');
        }

        $field.appendTo($fields);
      }

      return $fields;
    },
    
    'startGame' : function(tt, settings) {
      tt.topTrumpsTurn = settings.players[settings.beginner];
    
      $('.top-trumps-overlay', tt).remove();
      
      topTrumpsMethods.nextTurn(tt, settings);
    },
    
    'nextTurn' : function(tt, settings) {
      settings.activeCards = {
        'cpu'  : settings.stacks.cpu.shift(),
        'user' : settings.stacks.user.shift()
      };
      
      topTrumpsMethods.renderCards(settings, tt);
    },
    
    'compareCards' : function(field, settings, tt) {
      var activeCards = settings.activeCards;
      
      var result = 'draw';
      switch (settings.fields[field].comparison) {
        case '<':
          if (activeCards.cpu.fields[field] < activeCards.user.fields[field]) {
            result = 'cpu';
          }
          else {
            result = 'user';
          }
          break;
          
        case '>':
          if (activeCards.cpu.fields[field] > activeCards.user.fields[field]) {
            result = 'cpu';
          }
          else {
            result = 'user';
          }
          break;
      }
      
      topTrumpsMethods.processResult(result, settings, tt);
    },
    
    'selectField' : function(settings, tt) {
      var activeCards = settings.activeCards;
      
      switch (settings.difficulty) {
        case 'easy':
          return Math.round(Math.random() * (settings.fields.length - 1));
          
        case 'normal':
        case 'hard':
          var diff = [];
          for (var i = 0; i < settings.fields.length; i++) {
            if (settings.fields[i].comparison == '>') {
              diff[i] = 1 - (settings.trumps[i] - activeCards.cpu.fields[i]) / settings.trumps[i];
            }
            else {
              diff[i] = 1 - (activeCards.cpu.fields[i] - settings.trumps[i]) / activeCards.cpu.fields[i];
            }
          }
          
          var field = 0;
          var relativeValue = 0;
          for (var i = 0; i < diff.length; i++) {
            if (relativeValue < diff[i]) {
              field = i;
              relativeValue = diff[i];
            }
          }
        
          return field;
          
      }
      
      return 0;
    },
    
    'processResult' : function(result, settings, tt) {      
      // Reset user if needed.
      switch (result) {
        case 'cpu':
        case 'user':
          if (tt.topTrumpsTurn != result) {
            tt.topTrumpsTurn = result;
          }
          
          settings.points[result]+= 1;
          
          $('.top-trumps-side.top-trumps-' + result + ' .top-trumps-points', tt).html(settings.points[result]);
        
          break;
        
        case 'draw':
          settings.requeued.cpu.push(settings.activeCards.cpu);
          settings.requeued.user.push(settings.activeCards.user);
          break;
      }
      
      tt.topTrumps = settings;
      
      if (settings.stacks.cpu.length > 0 && settings.stacks.user.length > 0) {
        topTrumpsMethods.nextTurn(tt, tt.topTrumps);
      }
      else {
        if (settings.trick == 'requeue' && settings.requeued.cpu.length > 0 && settings.requeued.user.length) {
          settings.stacks.cpu  = topTrumpsMethods.shuffleCards(settings.requeued.cpu);
          settings.stacks.user = topTrumpsMethods.shuffleCards(settings.requeued.user);
          tt.topTrumps = settings;
          
          topTrumpsMethods.nextTurn(tt, tt.topTrumps);
        }
        else {
          topTrumpsMethods.endGame(tt, tt.topTrumps);
        }
      }
    },
    
    'endGame' : function(tt, settings) {
      $('.top-trumps-card', tt).remove();
    }
  };

  $.fn.topTrumps = function(options) {
    var settings = topTrumpsMethods.prepareSettings(options);
    
    return this.each(function() {
      $this = $(this);
      $this.topTrumps = settings;
      
      topTrumpsMethods.renderGame($this, settings);
    });    
  };
})(jQuery);