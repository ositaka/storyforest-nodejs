import Component from 'classes/Component'
import { mapEach } from 'utils/dom'

export default class Preloader extends Component {
    constructor({ calendar }) {
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

        this.onChange(calendar)
    }

    createCalendar() {
        this.checkCurrentMonth()

        const delay = 400
        const events = document.querySelector('.school_calendar__events')
        const eventsGroup = document.querySelectorAll('.school_calendar__events__group')
        const header = document.querySelector('.school_calendar__header h2')
        const next = document.querySelector('.school_calendar__next')
        const prev = document.querySelector('.school_calendar__prev')

        mapEach(eventsGroup, element => {
            if (element.dataset.active) {
                element.style.display = 'block'
                header.innerHTML = `${element.dataset.month} ${element.dataset.year}`
            } else {
                element.removeAttribute('style')
            }
        })

        this.elements.toggle.addEventListener('click', () => {
            this.element.classList.toggle('open');
            // body.classList.toggle('opacity');

            checkPrevNext()
        })

        prev.addEventListener('click', () => {
            const currentEl = document.querySelector('.school_calendar__events [data-active="true"]')
            const prevEl = currentEl.previousElementSibling

            if (prevEl !== null) {
                prev.style.pointerEvents = 'none'
                events.style.transition = `opacity ${delay}ms ease`
                events.style.opacity = '0'
                delete currentEl.dataset.active
                prevEl.setAttribute('data-active', 'true')

                setTimeout(_ => {
                    events.style.opacity = '1'
                    currentEl.style.display = 'none'
                    prevEl.style.display = 'block'
                    prev.style.pointerEvents = 'all'
                }, delay)

                header.innerHTML = `${prevEl.dataset.month} ${prevEl.dataset.year}`
            }

            checkPrevNext()
        })

        next.addEventListener('click', () => {
            const currentEl = document.querySelector('.school_calendar__events [data-active="true"]')
            const nextEl = currentEl.nextElementSibling

            if (nextEl !== null) {
                next.style.pointerEvents = 'none'
                events.style.transition = `opacity ${delay}ms ease`
                events.style.opacity = '0'
                delete currentEl.dataset.active
                nextEl.setAttribute('data-active', 'true')

                setTimeout(_ => {
                    events.style.opacity = '1'
                    currentEl.style.display = 'none'
                    nextEl.style.display = 'block'
                    next.style.pointerEvents = 'all'
                }, delay)

                header.innerHTML = `${nextEl.dataset.month} ${nextEl.dataset.year}`
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

    checkCurrentMonth() {
        if (document.documentElement.lang === 'en-gb') {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            this.setActiveMonth(monthNames)
        }
        else if (document.documentElement.lang === 'pt-pt') {
            const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
            this.setActiveMonth(monthNames)
        }
    }

    setActiveMonth(monthNames) {
        const dateObj = new Date()
        const eventsGroup = document.querySelectorAll('.school_calendar__events__group')
        const monthNumber = dateObj.getMonth()
        const monthName = monthNames[monthNumber]

        mapEach(eventsGroup, element => {
            if (element.dataset.month === monthName) {
                element.setAttribute('data-active', 'true')
            }
        })
    }

    onChange(calendar) {
        if (typeof calendar !== 'undefined') {
            this.element.innerHTML = calendar
            this.elements.header.innerHTML = ''
            this.createCalendar()
        }
    }
}
