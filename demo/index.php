<?php
  $cards = array();
  for ($i = 1; $i <= 32; $i++) {
    $cards[] = "{'name': 'Example $i', 'fields' : [" . rand(10, 100) . ", " . rand(1, 10) . ", " . rand(50, 200) . ", " . rand(400, 600) . "]}";
  }
?>
<html>
  <head>
    <title>Top Trumps Example</title>

    <script type="text/javascript" src="http://code.jquery.com/jquery-1.7.2.min.js"></script>
    <script type="text/javascript" src="../top_trumps.js"></script>

    <script type="text/javascript">
      $(document).ready(function() {
        $('#cardgame').topTrumps({
          'fields' : [
            {'name': 'Smaller A', 'comparison' : '<'},
            {'name': 'Bigger A',  'comparison' : '>'},
            {'name': 'Bigger B',  'comparison' : '>'},
            {'name': 'Smaller B', 'comparison' : '<'}
          ],
          'cards' : [<?php print implode(',', $cards); ?>],

          'trick' : 'requeue',

          'difficulty' : 'hard'
        });
      });
    </script>

    <link href="../top_trumps.css" media="all" rel="stylesheet" type="text/css">
  </head>
  <body>
    <div id="cardgame"></div>
  </body>
</html>