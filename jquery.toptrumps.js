/**
 * jQuery TopTrumps
 *
 * This plugins turns every container into a fully customizable top trumps game.
 * Please check wikipedia if you don't know what a top trums game is.
 * http://en.wikipedia.org/wiki/Top_Trumps
 *
 * Every top trumps game you create can be customized to your needs.
 * You can change the difficulty, define fields & comparison logic,
 * add cards and use some callbacks to customize the game.
 * Although you can change the entire look of the cards via css & javascript.
 *
 * @version 0.9.0
 * @author Christian Hanne <mail@christianhanne.de>
 * @link http://www.christianhanne.de
 * @link http://demo.christianhanne.de/jquery_top_trumps
 */
(function($) {
  "use strict";

  $.fn.toptrumps = function(options) {
    var methods = {
      'prepareSettings' : function(options) {
        var settings = $.extend(true, {
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

          // Will be called after top trumps has been built.
          'onInit' : function($instance) {},

          // Will be called when game ends.
          'onComplete' : function($instance) {},

          // Use this method to change the look of your cards.
          // For example you could add a fancy looking image.
          'renderCard' : function($card, card, fields) {}
        }, options);

        // Prepare players.
        settings.players = ['user', 'cpu'];

        // Validate & prepare comparison fields.
        settings.fields = methods.prepareFields(settings.fields);

        // Validate & prepare game cards.
        settings.cards = methods.prepareCards(settings.cards, settings.fields);

        // Prepare trumps, this is useful during gameplay.
        // Also the cpu uses trumps to chose the best field.
        settings.trumps = methods.prepareTrumps(settings.cards, settings.fields);

        // Prepare stacks for both players.
        settings.stacks = methods.prepareStacks(settings.cards, settings.players);

        // Prepare points array.
        settings.points = {'user' : 0, 'cpu' : 0};

        // Define which player should start the game.
        settings.beginner = 0;
        if (settings.difficulty === 'hard') {
          settings.beginner = 1;
        }

        // Define the requeue array, this will be used for trick cards.
        settings.requeued = {'cpu' : [], 'user' : []};

        return settings;
      },

      'shuffleCards' : function(cards) {
        var i = cards.length;

        if (i === 0) {
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
          if (typeof fields[i].name === 'undefined' || typeof fields[i].comparison === 'undefined') {
            continue;
          }

          if (fields[i].comparison !== '<' && fields[i].comparison !== '>') {
            continue;
          }

          validFields.push(fields[i]);
        }

        return validFields;
      },

      'prepareCards' : function(cards, fields) {
        var validCards = [];
        for (var i = 0; i < cards.length; i++) {
          if (typeof cards[i].name === 'undefined' || typeof cards[i].fields === 'undefined') {
            continue;
          }

          if (cards[i].fields.length !== fields.length) {
            continue;
          }

          validCards.push(cards[i]);
        }

        // Shuffle cards to randomize cards order.
        validCards = methods.shuffleCards(validCards);

        return validCards;
      },

      'prepareTrumps' : function(cards, fields) {
        var trumps = [];
        for (var i = 0; i < cards.length; i++) {
          for (var j = 0; j < cards[i].fields.length; j++) {
            if (typeof trumps[j] === 'undefined') {
              trumps[j] = cards[i].fields[j];
            }
            else if (fields[j].comparison === '>' && cards[i].fields[j] > trumps[j]) {
              trumps[j] = cards[i].fields[j];
            }
            else if (fields[j].comparison === '<' && cards[i].fields[j] < trumps[j]) {
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
        tt.addClass('tt-wrapper');

        for (var i = 0; i < settings.players.length; i++) {
          methods.renderCardDeck(tt, settings, settings.players[i]);
        }

        var $overlay = $('<div/>').addClass('tt-overlay');
        $('<a/>').addClass('tt-start-button').html('Start Game').appendTo($overlay);
        $overlay.appendTo(tt);

        $('a.tt-start-button', tt).click(function(e) {
          methods.startGame(tt, tt.topTrumps);
          e.preventDefault();
        });

        settings.onInit(tt, $.extend(true, {}, settings));
      },

      'renderCardDeck' : function(tt, settings, player) {
        var $player = $('<div/>').addClass('tt-side tt-' + player);
        $('<div/>').addClass('tt-card-wrapper').appendTo($player);
        $('<div/>').addClass('tt-points').html('0').appendTo($player);

        if (settings.trick === 'requeue') {
          $('<div/>').addClass('tt-side-requeued').appendTo($player);
        }

        $player.appendTo(tt);
      },

      'renderCards' : function(settings, tt) {
        var cards = settings.activeCards;

        $('.tt-card', tt).remove();

        methods.renderCard(cards.cpu, 'cpu', settings, tt);
        methods.renderCard(cards.user, 'user', settings, tt);

        // Add event handler to card fields.
        if (tt.topTrumpsTurn === 'user') {
          $('.tt-card-field', tt).click(function() {
            var ident = $(this).attr('id');
            var ident_arr = ident.split('-');

            methods.compareCards(ident_arr[(ident_arr.length - 1)], tt.topTrumps, tt);

            return false;
          });
        }
        else {
          var field = methods.selectField(tt.topTrumps, tt);
          $('#tt-card-field-cpu-' + field).addClass('active');

          setTimeout(function() {
            methods.compareCards(field, tt.topTrumps, tt);
          }, 2000);
        }
      },

      'renderCard' : function(card, player, settings, tt) {
        var $card = $('<div/>').addClass('tt-card');

        if (player === tt.topTrumpsTurn || player === 'user') {
          $('<div/>').addClass('tt-card-name').html(card.name).appendTo($card);

          var $fields = methods.renderCardFields(card, settings.fields, settings.trumps, player);
          $fields.appendTo($card);
        }
        else {
          $('<div/>').addClass('tt-card-name').html('?').appendTo($card);
          $card.addClass('deactivated');
        }

        settings.renderCard($card, $.extend(true, {}, card), $.extend(true, {}, settings.fields));

        $card.appendTo(tt.find('.tt-' + player + ' .tt-card-wrapper'));
      },

      'renderCardFields' : function(card, fields, trumps, player) {
        var $fields = $('<div/>').addClass('tt-card-fields');

        for (var i = 0; i < fields.length; i++) {
          var $field = $('<div/>').attr('id', 'tt-card-field-' + player + '-' + i).addClass('tt-card-field');
          $('<span/>').addClass('tt-card-field-value').html(card.fields[i]).appendTo($field);

          if (typeof fields[i].classes !== 'undefined') {
            $field.addClass(fields[i].classes);
          }

          if (typeof fields[i].prefix !== 'undefined') {
            $('<span/>').addClass('tt-card-field-prefix').html(fields[i].prefix).prependTo($field);
          }

          if (typeof fields[i].suffix !== 'undefined') {
            $('<span/>').addClass('tt-card-field-suffix').html(fields[i].suffix).appendTo($field);
          }

          $('<span/>').addClass('tt-card-field-name').html(fields[i].name).prependTo($field);

          // Mark this field as a trump.
          if (card.fields[i] === trumps[i]) {
            $field.addClass('top-trump');
          }

          $field.appendTo($fields);
        }

        return $fields;
      },

      'startGame' : function(tt, settings) {
        tt.topTrumpsTurn = settings.players[settings.beginner];

        $('.tt-overlay', tt).remove();

        methods.nextTurn(tt, settings);
      },

      'nextTurn' : function(tt, settings) {
        settings.activeCards = {
          'cpu'  : settings.stacks.cpu.shift(),
          'user' : settings.stacks.user.shift()
        };

        methods.renderCards(settings, tt);
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

        methods.processResult(result, settings, tt);
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
              if (settings.fields[i].comparison === '>') {
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
            if (tt.topTrumpsTurn !== result) {
              tt.topTrumpsTurn = result;
            }

            settings.points[result]+= 1;

            $('.tt-side.tt-' + result + ' .tt-points', tt).html(settings.points[result]);

            break;

          case 'draw':
            settings.requeued.cpu.push(settings.activeCards.cpu);
            settings.requeued.user.push(settings.activeCards.user);
            break;
        }

        tt.topTrumps = settings;

        if (settings.stacks.cpu.length > 0 && settings.stacks.user.length > 0) {
          methods.nextTurn(tt, tt.topTrumps);
        }
        else {
          if (settings.trick === 'requeue' && settings.requeued.cpu.length > 0 && settings.requeued.user.length) {
            settings.stacks.cpu  = methods.shuffleCards(settings.requeued.cpu);
            settings.stacks.user = methods.shuffleCards(settings.requeued.user);
            tt.topTrumps = settings;

            methods.nextTurn(tt, tt.topTrumps);
          }
          else {
            methods.endGame(tt, tt.topTrumps);
          }
        }
      },

      'endGame' : function(tt, settings) {
        $('.tt-card', tt).remove();

        settings.onComplete(tt, $.extend(true, {}, settings));
      }
    },
    settings = methods.prepareSettings(options);

    return this.each(function() {
      var $this = $(this);
      $this.topTrumps = settings;
      methods.renderGame($this, settings);
    });
  };
})(jQuery);