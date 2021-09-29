import GSAP from 'gsap'

import Component from 'classes/Component'
import { mapEach } from 'utils/dom'

export default class Preloader extends Component {
    constructor({ calendarEvents }) {
        super({
            element: '.school_calendar',
            elements: {
                events: '.school_calendar__events',
                eventsGroup: '.school_calendar__events__group',
                header: '.school_calendar__header h2',
                next: '.school_calendar__next',
                prev: '.school_calendar__prev',
                toggle: '.school_calendar__toggle',
            },
        })

        this.createCalendar()

        this.onChange(calendarEvents)
    }

    createCalendar() {
        const delay = 400

        this.elements.toggle.addEventListener('click', () => {

            this.element.classList.toggle('open');
            // body.classList.toggle('opacity');

            mapEach(this.elements.eventsGroup, element => {
                if (element.dataset.active) {
                    element.style.display = 'block'
                    this.elements.header.innerHTML = `${element.dataset.month} ${element.dataset.year}`
                }
            })

            checkPrevNext()
        })


        this.elements.prev.addEventListener('click', () => {
            const currentEl = document.querySelector('.school_calendar__events [data-active="true"]')
            const prevEl = currentEl.previousElementSibling

            if (prevEl !== null) {
                this.elements.prev.style.pointerEvents = 'none'
                this.elements.events.style.transition = `opacity ${delay}ms ease`
                this.elements.events.style.opacity = '0'
                delete currentEl.dataset.active
                prevEl.setAttribute('data-active', 'true')

                setTimeout(_ => {
                    this.elements.events.style.opacity = '1'
                    currentEl.style.display = 'none'
                    prevEl.style.display = 'block'
                    this.elements.prev.style.pointerEvents = 'all'
                }, delay)

                this.elements.header.innerHTML = `${prevEl.dataset.month} ${prevEl.dataset.year}`
            }

            checkPrevNext()
        })


        this.elements.next.addEventListener('click', () => {
            const currentEl = document.querySelector('.school_calendar__events [data-active="true"]')
            const nextEl = currentEl.nextElementSibling

            if (nextEl !== null) {
                this.elements.next.style.pointerEvents = 'none'
                this.elements.events.style.transition = `opacity ${delay}ms ease`
                this.elements.events.style.opacity = '0'
                delete currentEl.dataset.active
                nextEl.setAttribute('data-active', 'true')

                setTimeout(_ => {
                    this.elements.events.style.opacity = '1'
                    currentEl.style.display = 'none'
                    nextEl.style.display = 'block'
                    this.elements.next.style.pointerEvents = 'all'
                }, delay)

                this.elements.header.innerHTML = `${nextEl.dataset.month} ${nextEl.dataset.year}`
            }

            checkPrevNext()
        })

        function checkPrevNext() {
            setTimeout(_ => {
                const currentEl = document.querySelector('.school_calendar__events [data-active="true"]')
                const prevEl = currentEl.previousElementSibling
                const nextEl = currentEl.nextElementSibling

                if (prevEl == null) {
                    prevEl.style.transition = `opacity ${delay}ms ease`
                    prevEl.style.opacity = '.3'
                    prevEl.style.pointerEvents = 'none'
                } else {
                    prevEl.style.transition = `opacity ${delay}ms ease`
                    prevEl.style.opacity = '1'
                    prevEl.style.pointerEvents = 'all'
                }
                if (nextEl == null) {
                    nextEl.style.transition = `opacity ${delay}ms ease`
                    nextEl.style.opacity = '.3'
                    nextEl.style.pointerEvents = 'none'
                } else {
                    nextEl.style.transition = `opacity ${delay}ms ease`
                    nextEl.style.opacity = '1'
                    nextEl.style.pointerEvents = 'all'
                }
            }, delay)
        }

    }

    onChange(calendarEvents) {
        if (typeof calendarEvents !== 'undefined') {
            this.elements.events.innerHTML = calendarEvents
        }
    }
}
