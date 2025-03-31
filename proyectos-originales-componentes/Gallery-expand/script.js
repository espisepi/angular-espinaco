const grid = document.querySelector('.grid')
const imagesCount = 16
const wrapper = document.querySelector('.wrapper')
let bigImage
let boolVal = false

for (let i = 0; i < imagesCount; i++) {
  const div = document.createElement('div')
  div.classList.add('img-wrapper')

  const img = document.createElement('img')
  img.classList.add('grid-img')

  img.src = `images/img-${i + 1}.jpg`
  div.append(img)
  grid.append(div)

  img.addEventListener('click', (e) => {
    bigImage = document.createElement('img')
    bigImage.classList.add('big-img')
    bigImage.src = e.target.src
    wrapper.append(bigImage)

    grid.classList.add('change')
  })
}

const shadow = document.querySelector('.shadow')

grid.addEventListener('mousemove', (e) => {
  shadow.style.opacity = 1
  let top = e.clientY - grid.getBoundingClientRect().top
  let left = e.clientX - grid.getBoundingClientRect().left

  shadow.style.top = `${top}px`
  shadow.style.left = `${left}px`
})

grid.addEventListener('mouseleave', (e) => {
  shadow.style.opacity = 0
})

document.body.addEventListener('click', (e) => {
  if (e.target !== bigImage && boolVal) {
    grid.classList.remove('change')
    wrapper.removeChild(bigImage)
    boolVal = false
  } else {
    boolVal = true
  }
})
