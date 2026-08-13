// timer ID
let timer = 0;

function generate() {
  const tsParticleRef = document.getElementById('tsparticles');
  let number = document.getElementById('number');

  // preventing to click `start` btn multiple times
  const btnRef = document.getElementById('btnStart');
  if (btnRef) {
    btnRef.disabled = true;
    btnRef.classList.add('disabled');
  }

  if (tsParticleRef) {
    tsParticleRef.style.display = 'none';
  }

  if (!number) return;

  // If first time generating, textboxes are animated to 'shrink'
  if (number.classList.contains('noDisplay')) {
    let bigMin = document.getElementById('bigMin');
    let bigMax = document.getElementById('bigMax');
    let smallMin = document.getElementById('smallMin');
    let smallMax = document.getElementById('smallMax');

    if (!bigMin) return;
    if (!bigMax) return;
    if (!smallMin) return;
    if (!bigMin) return;

    // Make the boxes smaller
    bigMin.classList.add('small');
    bigMax.classList.add('small');

    // Animate min
    document.getElementById('sMinBox').value =
      document.getElementById('bMinBox').value;

    var minAnimate = document.getElementById('bigMin')?.animate(
      [
        { transform: 'translate(0px, 0px)' },
        {
          transform:
            'translate(' +
            (smallMin.offsetLeft -
              bigMin.offsetLeft -
              (bigMin.clientWidth / 2 - smallMin.clientWidth / 2)) +
            'px, ' +
            (smallMin.offsetTop -
              bigMin.offsetTop +
              -1 * (bigMin.clientHeight / 2 - smallMin.clientHeight / 2)) +
            'px)',
        },
      ],
      {
        duration: 200,
        iterations: 1,
        easing: 'ease',
      }
    );

    if (!minAnimate) return;

    minAnimate.onfinish = function () {
      if (!smallMin) return;
      if (!bigMin) return;
      if (!number) return;

      smallMin.classList.remove('hidden');
      bigMin.classList.add('noDisplay');
      number.classList.remove('noDisplay');
      // Generate random number after animation finished
      animateNumber(number);
    };

    // Animate max
    document.getElementById('sMaxBox').value =
      document.getElementById('bMaxBox').value;
    var maxAnimate = document.getElementById('bigMax').animate(
      [
        { transform: 'translate(0px, 0px)' },
        {
          transform:
            'translate(' +
            (smallMax.offsetLeft -
              bigMax.offsetLeft -
              (bigMax.clientWidth / 2 - smallMax.clientWidth / 2)) +
            'px, ' +
            (smallMax.offsetTop -
              bigMax.offsetTop +
              -1 * (bigMax.clientHeight / 2 - smallMax.clientHeight / 2)) +
            'px)',
        },
      ],
      {
        duration: 200,
        iterations: 1,
        easing: 'ease',
      }
    );
    maxAnimate.onfinish = function () {
      smallMax.classList.remove('hidden');
      bigMax.classList.add('noDisplay');
      number.classList.remove('noDisplay');
    };
  } else {
    animateNumber(number);
  }
}

function animateNumber(number) {
  number.classList.remove('largeNumber');
  let from = parseInt(document.getElementById('sMinBox').value);
  let to = parseInt(document.getElementById('sMaxBox').value);

  // Vallidation
  if (isNaN(from)) {
    from = 0;
  }
  if (isNaN(to)) {
    to = 0;
  }
  if (from > to) {
    let temp = from;
    from = to;
    to = temp;
  }
  document.getElementById('sMinBox').value = from;
  document.getElementById('sMaxBox').value = to;

  // Start timer for random number animation
  let t = 0;
  timer = setInterval(displayNumber, 60);

  // console.log(this);

  function displayNumber() {
    // console.log("hhe");
    const num = Math.floor(Math.random() * (to - from + 1) + from);

    // Animate/show 10 random numbers then display the chosen number in a larger font
    // if (t == 50) {
    //   clearInterval(timer);
    //   number.classList.add("largeNumber");
    // } else {
    //   number.classList.remove("hidden");
    //   number.innerHTML = num;
    // }
    // t++;

    number.classList.remove('hidden');
    number.innerHTML = num;
  }
}

animateNumber.prototype.stop = function () {
  const btnRef = document.getElementById('btnStart');
  const tsParticleRef = document.getElementById('tsparticles');
  let number = document.getElementById('number');

  if (btnRef) {
    btnRef.disabled = false;
    btnRef.classList.remove('disabled');
  }
  if (tsParticleRef) {
    tsParticleRef.style.display = 'block';
  }

  clearInterval(timer);
  number?.classList.add('largeNumber');
};

/**
 * set default number for minimum and maximum through URL query params
 */
const urlParams = new URLSearchParams(window.location.search);
const minStart = String(urlParams.get('start'));
const maxEnd = String(urlParams.get('end'));
console.log({ maxEnd });

document.getElementById('bMinBox').value = !isNaN(minStart) ? minStart : 1;
document.getElementById('bMaxBox').value = !isNaN(maxEnd) ? maxEnd : 1000;
