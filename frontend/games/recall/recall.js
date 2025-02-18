(function () {
    var Memory = {
        init: function (cards) {
            this.$game = $(".game");
            this.$modal = $(".modal");
            this.$overlay = $(".modal-overlay");
            this.$restartButton = $("button.restart");
            this.cardsArray = $.merge(cards, cards);
            this.clickCount = 0; // Initialize click counter
            this.shuffleCards(this.cardsArray);
            this.setup();
        },

        shuffleCards: function (cardsArray) {
            this.$cards = $(this.shuffle(this.cardsArray));
        },

        setup: function () {
            this.html = this.buildHTML();
            this.$game.html(this.html);
            this.$memoryCards = $(".card");
            this.paused = false;
            this.guess = null;
            this.clickCount = 0; // Reset click counter on game setup
            this.binding();
        },

        binding: function () {
            this.$memoryCards.on("click", this.cardClicked);
            this.$restartButton.on("click", $.proxy(this.reset, this));
        },


        
        cardClicked: function () {
            var _ = Memory;
            var $card = $(this);
        
            // Only increment the counter if the card is flipped 
            if (
                !_.paused &&
                !$card.find(".inside").hasClass("matched") &&
                !$card.find(".inside").hasClass("picked")
            ) {
                // Flip the card (add "picked" class)
                $card.find(".inside").addClass("picked");
        
                // Increment the click count only when the card is turned
                _.clickCount++;
        
                if (!_.guess) {
                    _.guess = $(this).attr("data-id");
                } else if (_.guess == $(this).attr("data-id") && !$(this).hasClass("picked")) {
                    $(".picked").addClass("matched");
                    _.guess = null;
                } else {
                    _.guess = null;
                    _.paused = true;
                    setTimeout(function () {
                        $(".picked").removeClass("picked");
                        Memory.paused = false;
                    }, 600);
                }



                

                if ($(".matched").length == $(".card").length) {
                    _.win();
                }



                //force win condition for testing + modal

                /*
                if (true) { 
                    _.win();
                }
                */
                


                
            }
        },


        win: function () {
            this.paused = true;
            setTimeout(function () {
                Memory.showModal();
                Memory.$game.fadeOut();
            }, 1000);
        },

        showModal: function () {
            const optimalClicks = this.cardsArray.length; // Minimum clicks for perfect play
            this.$overlay.show();
            this.$modal.find(".message").html(`
                <p>It took you <strong>${this.clickCount}</strong> clicks to finish!</p>
            `);
            this.$modal.fadeIn("slow");
        },
        

        hideModal: function () {
            this.$overlay.hide();
            this.$modal.hide();
        },

        reset: function () {
            this.hideModal();
            this.shuffleCards(this.cardsArray);
            this.setup();
            this.$game.show("slow");
        },

        shuffle: function (array) {
            var counter = array.length,
                temp,
                index;
            while (counter > 0) {
                index = Math.floor(Math.random() * counter);
                counter--;
                temp = array[counter];
                array[counter] = array[index];
                array[index] = temp;
            }
            return array;
        },

        buildHTML: function () {
            var frag = "";
            this.$cards.each(function (k, v) {
                frag +=
                    '<div class="card" data-id="' +
                    v.id +
                    '"><div class="inside">\
                    <div class="front"><img src="' +
                    v.img +
                    '"\
                    alt="' +
                    v.name +
                    '" /></div>\
                    <div class="back"><img src="../../logo/logoBlack.svg"\
                    alt="Logo Icon" /></div></div>\
                    </div>';
            });
            return frag;
        },
        
        
    };

    var cards = [
        {
            name: "octopus",
            img: "../../logo/animals/octopus.svg",
            id: 1,
        },
        {
            name: "cheetah",
            img: "../../logo/animals/cheetah.svg",
            id: 2,
        },
        {
            name: "crocodile",
            img: "../../logo/animals/crocodile.svg",
            id: 3,
        },
        {
            name: "dog",
            img: "../../logo/animals/dog.svg",
            id: 4,
        },
        {
            name: "elephant",
            img: "../../logo/animals/elephant.svg",
            id: 5,
        },
        {
            name: "goose",
            img: "../../logo/animals/goose.svg",
            id: 6,
        },
        {
            name: "swan",
            img: "../../logo/animals/swan.svg",
            id: 7,
        },
        {
            name: "panda",
            img: "../../logo/animals/panda.svg",
            id: 8,
        },
        {
            name: "seahorse",
            img: "../../logo/animals/seahorse.svg",
            id: 9,
        },
        {
            name: "shark",
            img: "../../logo/animals/shark.svg",
            id: 10,
        },
        {
            name: "squid",
            img: "../../logo/animals/squid.svg",
            id: 11,
        },
        {
            name: "turtle",
            img: "../../logo/animals/turtle.svg",
            id: 12,
        },
    ];

    Memory.init(cards);
})();
