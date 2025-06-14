const heartPaths = [
    "M607.59,327.47c2.37,2.13,5.15,6.41,6.12,9.45,11.8-25.93,44.81-14.39,45.35,12.23.41,20.05-18.56,38.57-36,45.58-5.36,2.16-7.91,3.46-13.53,1.76-20.38-6.16-42.78-27.25-40.43-50.14,1.85-18.02,23.08-32.72,38.49-18.89Z",
    "M485.16,219.9c16.52-18.67,45.29-4.46,38.32,20.63-3.39,12.21-15.73,21.96-24.15,30.58-5.3,5.43-10.1,11.52-15.9,16.54-16.41-13.11-38.59-27.5-47.75-47.05-4.49-9.58-5.59-21.69-.57-30.85,12.95-23.64,47.72-16.29,50.06,10.15Z",
    "M612.69,215.05c4.02-5.47,6.78-9.87,13.38-12.59,23.06-9.47,39.32,14.01,31.5,35.63-3.69,10.21-22.3,27.5-31.02,34.79-2.24,1.87-11.29,9.38-13.55,9.32-19.38-13.84-49.66-33.45-45.89-61.09,3.22-23.64,37.08-28.42,45.57-6.07Z",
    "M613.87,569.52c2.37,2.13,5.15,6.41,6.12,9.45,11.8-25.93,44.81-14.39,45.35,12.23.41,20.05-18.56,38.57-36,45.58-5.36,2.16-7.91,3.46-13.53,1.76-20.38-6.16-42.78-27.25-40.43-50.14,1.85-18.02,23.08-32.72,38.49-18.89Z",
    "M491.43,461.95c16.52-18.67,45.29-4.46,38.32,20.63-3.39,12.21-15.73,21.96-24.15,30.58-5.3,5.43-10.1,11.52-15.9,16.54-16.41-13.11-38.59-27.5-47.75-47.05-4.49-9.58-5.59-21.69-.57-30.85,12.95-23.64,47.72-16.29,50.06,10.15Z",
    "M618.96,457.1c4.02-5.47,6.78-9.87,13.38-12.59,23.06-9.47,39.32,14.01,31.5,35.63-3.69,10.21-22.3,27.5-31.02,34.79-2.24,1.87-11.29,9.38-13.55,9.32-19.38-13.84-49.66-33.45-45.89-61.09,3.22-23.64,37.08-28.42,45.57-6.07Z"
];

const colors = ['#df006a', '#ff94c2'];
const title = document.getElementById('title');
const rect = title.getBoundingClientRect();
const scrollX = window.scrollX || window.pageXOffset;
const scrollY = window.scrollY || window.pageYOffset;
const titleCenterX = window.innerWidth / 2 - 175;
const titleCenterY = window.innerHeight / 2 - 65;

for (let i = 0; i < 40; i++) {
    const heart = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    heart.setAttribute("viewBox", "0 0 650 650");
    heart.classList.add("heart");
    heart.style.width = "11rem";
    heart.style.height = "10rem";

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", heartPaths[i % heartPaths.length]);
    path.style.fill = colors[i % colors.length];
    heart.appendChild(path);

    // Larger spread:
    const offsetX = (Math.random() - 0.5) * 1350; 
    const offsetY = (Math.random() - 0.5) * 1000; 

    heart.style.left = `${titleCenterX + offsetX}px`;
    heart.style.top = `${titleCenterY + offsetY}px`;

    heart.style.setProperty('--x-move', `${Math.random() * 40 - 20}px`);
    heart.style.setProperty('--y-move', `${-40 - Math.random() * 60}px`);
    heart.style.setProperty('--rotate', `${Math.random() * 40 - 20}deg`);

    document.body.appendChild(heart);
}

title.addEventListener("mouseenter", () => {
    document.querySelectorAll('.heart').forEach((heart) => {
        heart.classList.remove('animate');
        void heart.offsetWidth;
        heart.classList.add('animate');
        heart.addEventListener('animationend', () => {
            heart.classList.remove('animate');
        }, { once: true });
    });
});