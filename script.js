class Menu {
    constructor({
        menuItemsData,
        centerX = 250,
        centerY = 250,
        outerRadius = 250,
        innerRadius = 180,
        iconRadius = 215,
        sectorsGroupId = 'sectors',
        iconsContainerId = 'icons',
        centerCircleSelector = '.center',
        headingSelector = '#title-text',
        descriptionSelector = '#description-text',
        circleSvgSelector = '.circle-svg',
        fadeInDelay = 0.04,
        animationDuration = 200,
        selectionSoundSrc = 'selection.mp3'
    } = {}) {
        this.menuItemsData = menuItemsData || [
            { title: 'Главная', description: 'Перейти на главную страницу', icon: 'fa-home', ident: 'home' },
            { title: 'Профиль', description: 'Просмотреть и редактировать профиль', icon: 'fa-user', ident: 'profile' },
            { title: 'Сообщения', description: 'Просмотреть все сообщения', icon: 'fa-envelope', ident: 'messages' },
            { title: 'Уведомления', description: 'Просмотреть уведомления', icon: 'fa-bell', ident: 'notifications' },
            { title: 'Настройки', description: 'Настроить параметры', icon: 'fa-cog', ident: 'settings' },
            { title: 'Поиск', description: 'Искать по всему сайту', icon: 'fa-search', ident: 'search' },
            { title: 'Помощь', description: 'Получить помощь и поддержку', icon: 'fa-question-circle', ident: 'help' },
            { title: 'Выход', description: 'Выйти из аккаунта', icon: 'fa-sign-out-alt', ident: 'logout' },
            { title: 'Помощь', description: 'Получить помощь и поддержку', icon: 'fa-question-circle', ident: 'help' },
            { title: 'Выход', description: 'Выйти из аккаунта', icon: 'fa-sign-out-alt', ident: 'logout' }
        ];

        this.centerX = centerX;
        this.centerY = centerY;
        this.outerRadius = outerRadius;
        this.innerRadius = innerRadius;
        this.iconRadius = iconRadius;
        this.sectorsGroup = document.getElementById(sectorsGroupId);
        this.iconsContainer = document.getElementById(iconsContainerId);
        this.centerCircle = document.querySelector(centerCircleSelector);
        this.heading = document.querySelector(headingSelector);
        this.description = document.querySelector(descriptionSelector);
        this.circleSvgSelector = circleSvgSelector;
        this.fadeInDelay = fadeInDelay;
        this.animationDuration = animationDuration;
        this.sectors = [];
        this.animationPromises = [];
        this.activeSector = null;
        this.selectionSoundSrc = selectionSoundSrc;
    }

    init() {
        this.createSectorsAndIcons();
        this.handleEvents();
    }

    createSectorsAndIcons() {
        this.menuItemsData.forEach((item, index) => {
            const sector = this.createSector(index, item);
            const icon = this.createIcon(index, item);

            this.sectors.push(sector);
            this.sectorsGroup.appendChild(sector.element);
            this.iconsContainer.appendChild(icon.element);

            const animationPromise = this.fadeIn(sector.element, index * this.fadeInDelay);
            const iconAnimationPromise = this.fadeIn(icon.element, index * this.fadeInDelay);
            this.animationPromises.push(animationPromise, iconAnimationPromise);
        });

        Promise.all(this.animationPromises).then(() => {
            this.clearStyles(this.sectorsGroup.querySelectorAll('.sector'));
            this.clearStyles(this.iconsContainer.querySelectorAll('.icon'));

            const totalAnimationTime = this.menuItemsData.length / 100;
            this.expandCircle(this.centerCircle, this.heading, this.description, this.animationDuration);
        });
    }

    createSector(index, item) {
        const totalItems = this.menuItemsData.length;
        const startAngle = (index / totalItems) * 2 * Math.PI;
        const endAngle = ((index + 1) / totalItems) * 2 * Math.PI;
        const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

        const x1Outer = this.centerX + this.outerRadius * Math.cos(startAngle);
        const y1Outer = this.centerY + this.outerRadius * Math.sin(startAngle);
        const x2Outer = this.centerX + this.outerRadius * Math.cos(endAngle);
        const y2Outer = this.centerY + this.outerRadius * Math.sin(endAngle);

        const x1Inner = this.centerX + this.innerRadius * Math.cos(startAngle);
        const y1Inner = this.centerY + this.innerRadius * Math.sin(startAngle);
        const x2Inner = this.centerX + this.innerRadius * Math.cos(endAngle);
        const y2Inner = this.centerY + this.innerRadius * Math.sin(endAngle);

        const pathData = [
            `M ${x1Inner},${y1Inner}`,
            `L ${x1Outer},${y1Outer}`,
            `A ${this.outerRadius},${this.outerRadius} 0 ${largeArcFlag},1 ${x2Outer},${y2Outer}`,
            `L ${x2Inner},${y2Inner}`,
            `A ${this.innerRadius},${this.innerRadius} 0 ${largeArcFlag},0 ${x1Inner},${y1Inner}`,
            'Z'
        ].join(' ');

        const sectorElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        sectorElement.setAttribute('d', pathData);
        sectorElement.classList.add('sector');
        sectorElement.setAttribute('data-title', item.title);
        sectorElement.setAttribute('data-description', item.description);

        sectorElement.addEventListener('mouseenter', (event) => {
            if (this.activeSector && this.activeSector !== event.target) {
                this.activeSector.classList.remove('active');
            }
            const title = event.target.getAttribute('data-title');
            const description = event.target.getAttribute('data-description');
            this.updateTextContent(title, description);
            event.target.classList.add('active');
            this.activeSector = event.target;
        });

        sectorElement.addEventListener('mouseleave', (event) => {
            if (this.activeSector === event.target) {
                event.target.classList.remove('active');
                this.activeSector = null;
            }
        });

        sectorElement.addEventListener('click', (event) => {
            this.handleSectorClick(event.target);
            event.stopPropagation();
        });

        return { element: sectorElement };
    }

    createIcon(index, item) {
        const totalItems = this.menuItemsData.length;
        const anglePerItem = (2 * Math.PI) / totalItems;
        const midAngle = anglePerItem * index + anglePerItem / 2;

        const iconX = this.centerX + this.iconRadius * Math.cos(midAngle);
        const iconY = this.centerY + this.iconRadius * Math.sin(midAngle);

        const iconElement = document.createElement('i');
        iconElement.classList.add('fas', item.icon, 'icon');
        iconElement.style.left = `${iconX - 12}px`;
        iconElement.style.top = `${iconY - 12}px`;

        iconElement.addEventListener('click', (event) => {
            this.handleSectorClick(event.target);
            event.stopPropagation();
        });

        return { element: iconElement };
    }

    handleSectorClick(element) {
        const title = element.getAttribute('data-title');
        console.log(`Нажат элемент: ${title}`);
        this.playSound(this.selectionSoundSrc);
    }

    playSound(src) {
        const sound = new Audio(src);
        sound.play();
    }

    fadeIn(element, delay) {
        return new Promise(resolve => {
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transitionDelay = `${delay}s`;
                resolve();
            }, 200);
        });
    }

    expandCircle(circle, text, description, duration) {
        let radius = 0;
        const interval = setInterval(() => {
            radius += 1;
            circle.setAttribute('r', radius);
            if (radius > 100) {
                radius = 100;
            }
            circle.setAttribute('r', radius);

            const opacity = radius / 100;
            text.style.opacity = opacity;
            description.style.opacity = opacity;

            if (radius >= 100) {
                clearInterval(interval);
                circle.setAttribute('r', 100);
                text.style.opacity = 1;
                description.style.opacity = 1;
            }
        }, duration / 100);
    }

    clearStyles(elements) {
        setTimeout(() => {
            elements.forEach(element => {
                element.style.transitionDelay = '';
            });
        }, 1000);
    }

    handleEvents() {
        document.addEventListener('mousemove', (event) => {
            const rect = document.querySelector(this.circleSvgSelector).getBoundingClientRect();
            const x = event.clientX - rect.left - this.centerX;
            const y = event.clientY - rect.top - this.centerY;
            const angle = Math.atan2(y, x);
            let adjustedAngle = angle < 0 ? angle + 2 * Math.PI : angle;

            this.sectors.forEach((sector, index) => {
                const startAngle = (index / this.menuItemsData.length) * 2 * Math.PI;
                const endAngle = ((index + 1) / this.menuItemsData.length) * 2 * Math.PI;

                if (adjustedAngle >= startAngle && adjustedAngle < endAngle) {
                    if (this.activeSector !== sector.element) {
                        sector.element.dispatchEvent(new Event('mouseenter'));
                    }
                } else {
                    if (this.activeSector === sector.element) {
                        sector.element.dispatchEvent(new Event('mouseleave'));
                    }
                }
            });
        });

        document.addEventListener('click', (event) => {
            const rect = document.querySelector(this.circleSvgSelector).getBoundingClientRect();
            const x = event.clientX - rect.left - this.centerX;
            const y = event.clientY - rect.top - this.centerY;
            const angle = Math.atan2(y, x);
            let adjustedAngle = angle < 0 ? angle + 2 * Math.PI : angle;

            let clicked = false;

            this.sectors.forEach((sector, index) => {
                const startAngle = (index / this.menuItemsData.length) * 2 * Math.PI;
                const endAngle = ((index + 1) / this.menuItemsData.length) * 2 * Math.PI;

                if (adjustedAngle >= startAngle && adjustedAngle < endAngle) {
                    sector.element.dispatchEvent(new Event('click'));
                    clicked = true;
                }
            });

            if (!clicked) {
                console.log('Клик вне секторов');
            }
        });
    }

    updateTextContent(title, description) {
        const titleElement = document.querySelector('#title-text');
        const descriptionElement = document.querySelector('#description-text');

        if (!titleElement || !descriptionElement) {
            console.error('Title or description element not found');
            return;
        }

        while (descriptionElement.firstChild) {
            descriptionElement.removeChild(descriptionElement.firstChild);
        }

        titleElement.textContent = title;

        const words = description.split(' ');
        let line = '';
        words.forEach((word, index) => {
            const testLine = line + word + ' ';
            const testWidth = this.getTextWidth(testLine, descriptionElement);
            if (testWidth > 180 && index > 0) {
                const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
                tspan.setAttribute('x', this.centerX);
                tspan.setAttribute('dy', '1.2em');
                tspan.setAttribute('text-anchor', 'middle');
                tspan.textContent = line;
                descriptionElement.appendChild(tspan);
                line = word + ' ';
            } else {
                line = testLine;
            }
        });

        const tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
        tspan.setAttribute('x', this.centerX);
        tspan.setAttribute('dy', '1.2em');
        tspan.setAttribute('text-anchor', 'middle');
        tspan.textContent = line;
        descriptionElement.appendChild(tspan);

        const titleBox = titleElement.getBBox();
        const descriptionBox = descriptionElement.getBBox();
        const totalHeight = titleBox.height + descriptionBox.height;
        const centerY = this.centerY - totalHeight / 2;

        titleElement.setAttribute('y', centerY);
        descriptionElement.setAttribute('y', centerY + titleBox.height + 10);
    }

    getTextWidth(text, element) {
        const svg = document.querySelector(this.circleSvgSelector);
        const tempText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tempText.setAttribute('x', -99999);
        tempText.setAttribute('y', -99999);
        tempText.setAttribute('font-size', window.getComputedStyle(element).fontSize);
        tempText.textContent = text;
        svg.appendChild(tempText);
        const width = tempText.getBBox().width;
        svg.removeChild(tempText);
        return width;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const menu = new Menu();
    menu.init();
});
