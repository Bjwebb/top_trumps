jQuery TopTrumps
==========

This plugins turns any container into a fully customizable top trumps game.
Please check wikipedia if you don't know what a top trumps game is.
http://en.wikipedia.org/wiki/Top_Trumps

Every top trumps game you create can be customized to your needs. You can change the difficulty, define fields & comparison logic, add cards and use some callbacks to customize the game.
Although you can change the entire look of the cards via css & javascript.

Usage Example
---

The following example will create a top trumps game with 4 comparison fields & 12 cards.
Every player (user & cpu) will get 6 cards. Please note that the number of cards should be dividable by two.
Otherwise one player will get an additional card.

```javascript
$('#your-game-container').toptrumps({
  'fields' : [
    {'name': 'Smaller A', 'comparison' : '<'},
    {'name': 'Bigger A',  'comparison' : '>'},
    {'name': 'Bigger B',  'comparison' : '>'},
    {'name': 'Smaller B', 'comparison' : '<'}
  ],
  'cards' : [
    {'name': 'Example 1', 'fields' : [57, 8, 161, 534]},
    {'name': 'Example 2', 'fields' : [54, 10, 186, 524]},
    {'name': 'Example 3', 'fields' : [38, 7, 178, 553]},
    {'name': 'Example 4', 'fields' : [69, 4, 196, 410]},
    {'name': 'Example 5', 'fields' : [69, 9, 150, 464]},
    {'name': 'Example 6', 'fields' : [19, 2, 155, 463]},
    {'name': 'Example 7', 'fields' : [32, 2, 142, 534]},
    {'name': 'Example 8', 'fields' : [73, 5, 164, 443]},
    {'name': 'Example 9', 'fields' : [31, 5, 183, 546]},
    {'name': 'Example 10', 'fields' : [53, 8, 103, 557]},
    {'name': 'Example 11', 'fields' : [54, 3, 132, 428]},
    {'name': 'Example 12', 'fields' : [62, 6, 79, 445]}
  ]
});
```

Options
---

<table>
  <tr>
    <th>Option</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>fields (required)</td>
    <td>[]</td>
    <td>
      An array of fields used for comparison.<br />
      Each field should be an object defined as follows.<br />
      <strong>name</strong>: Some name that can be shown to the user.<br />
      <strong>classes</strong>: A custom class that should be added to this field. (optional)<br />
      <strong>prefix</strong>: A prefix that should be prepended to the field value. (optional)<br />
      <strong>suffix</strong>: A suffix that should be appended to the field value. (optional)<br />
      <strong>comparison</strong>: '>', '<' Defines what value would be better when comparing to cards.<br />
      <br />
      (add whatever variable you need, you can access them in the render functions)
    </td>
  </tr>
  <tr>
    <td>cards (required)</td>
    <td>[]</td>
    <td>
      An array of cards with values as defined above.<br />
      Cards will be shuffled and divided between user and NPC.<br />
      Each card is an object.<br />
      <strong>name</strong>: Human readable name of this card.<br />
      <strong>fields</strong>: An array of fields as defined above. Just define the field values.<br />
      <br />
      (add whatever variable you need, you can access them in the render functions)
    </td>
  </tr>
  <tr>
    <td>difficulty</td>
    <td>'normal'</td>
    <td>
      Defines the game difficulty. Possible values are:<br />
      <strong>easy</strong>: Player starts and CPU selects fields randomly.<br />
      <strong>normal</strong>: Player starts and CPU selects fields with highest chance to win.<br />
      <strong>hard</strong>: CPU starts and selects fields with highest chance to win.<br />
      <br />
      (On hard I was unable to beat the cpu... are you?)
    </td>
  </tr>
  <tr>
    <td>trick</td>
    <td>'ignore'</td>
    <td>
      What should the game do, if player & cpu have the same value on a selected field.
      By default we will <strong>ignore</strong> those cards and don't count them.
      You may also <strong>requeue</strong> them.
    </td>
  </tr>
</table>

Callbacks
---

This is a list of all available callbacks. The params should be understandable without further explanation (except: $ marks variables as jQuery objects).

<table>
  <tr>
    <th>Function</th>
    <th>Params</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>onInit</td>
    <td>$instance, settings</td>
    <td>Will be called after top trumps has been built.</td>
  </tr>
  <tr>
    <td>onComplete</td>
    <td>$instance, settings</td>
    <td>Will be called when game ends.</td>
  </tr>
  <tr>
    <td>renderCard</td>
    <td>$card, card, fields</td>
    <td>Use this method to change the look of your cards. For example you could add a fancy looking image.</td>
  </tr>
</table>
