const mySwiper = new Swiper('.swiper-container', {
    loop: true,

    // Navigation arrows
    navigation: {
        nextEl: '.slider-button-next',
        prevEl: '.slider-button-prev',
    },
});

// cart 

const buttonCart = document.querySelector('button.button-cart');
const modalCart = document.querySelector('#modal-cart');
const viewAll = document.querySelectorAll('.view-all');
const navigationLink = document.querySelectorAll('.navigation-link:not(.view-all)');
const longGoodsList = document.querySelector('.long-goods-list');
const showAcsessories = document.querySelectorAll('#acsessories');
const showClothing = document.querySelectorAll('#clothing');
const cartTableGoods = document.querySelector('.cart-table__goods');
const cardTableTotal = document.querySelector('.card-table__total');
const clearCart = document.querySelector('.cart-clear');

const getGoods = async () => {
    const result = await fetch('db/db.json');
    if (!result.ok) {
        throw 'Ошибка: ' + result.status;
    }
    return await result.json();
};

const cart = {
    cartGoods: [],
    renderCart() {
        cartTableGoods.textContent = '';
        this.cartGoods.forEach(({ id, name, price, count }) => {
            const trGood = document.createElement('tr');
            trGood.className = 'cart-item';
            trGood.dataset.id = id;

            trGood.innerHTML = `
                <td>${name}</td>
				<td>${price}$</td>
				<td><button class="cart-btn-minus">-</button></td>
				<td>${count}</td>
				<td><button class="cart-btn-plus">+</button></td>
				<td>${price * count}</td>
				<td><button class="cart-btn-delete">x</button></td>
            `;
            cartTableGoods.append(trGood);
        });

        const totalPrice = this.cartGoods.reduce((sum, item) => {
            return sum + item.price * item.count;
        }, 0);

        cardTableTotal.textContent = totalPrice + '$';
    },
    deleteGood(id) {
        this.cartGoods = this.cartGoods.filter(item => id !== item.id);
        this.renderCart();
    },
    minusGood(id) {
        for (const item of this.cartGoods) {
            if (item.id === id) {
                if (item.count <= 1) {
                    this.deleteGood(id);
                } else {
                    item.count--;
                }
                break;
            }
        }
        this.renderCart();
        this.updateCart();
    },

    plusGood(id) {
        for (const item of this.cartGoods) {
            if (item.id === id) {
                item.count++;
                break;
            }
        }
        this.renderCart();
        this.updateCart();
    },

    addCartGoods(id) {
        const goodItem = this.cartGoods.find(item => item.id === id);
        if (goodItem) {
            this.plusGood(id);
        } else {
            getGoods()
                .then(data => data.find(item => item.id === id))
                .then(({ id, name, price }) => {
                    this.cartGoods.push({
                        id,
                        name,
                        price,
                        count: 1
                    });
                    cart.updateCart();
                });
        };
    },
    updateCart() {
        const totalPrice = cart.cartGoods.reduce((sum, item) => {
            return sum + item.count;
        }, 0);
        if (!totalPrice) {
            document.querySelector('.cart-count').innerHTML = '';
        } else {
            document.querySelector('.cart-count').innerHTML = `${totalPrice}`;
        }
    }
}

cart.updateCart();

document.body.addEventListener('click', event => {
    const addToCart = event.target.closest('.add-to-cart');

    if (addToCart) {
        cart.addCartGoods(addToCart.dataset.id);
    }
})

cartTableGoods.addEventListener('click', event => {
    const target = event.target;

    if (target.tagName === 'BUTTON') {
        const id = target.closest('.cart-item').dataset.id;

        if (target.classList.contains('cart-btn-delete')) {
            cart.deleteGood(id);
        };

        if (target.classList.contains('cart-btn-minus')) {
            cart.minusGood(id);
        };

        if (target.classList.contains('cart-btn-plus')) {
            cart.plusGood(id);
        };
    }
});

clearCart.addEventListener('click', function (event) {
    event.preventDefault();
    cart.cartGoods.length = 0;
    cart.renderCart();
});

const openModal = () => {
    cart.renderCart();
    modalCart.classList.add('show');
};

const closeModal = () => {
    modalCart.classList.remove('show');
};

buttonCart.addEventListener('click', openModal);
modalCart.addEventListener('click', (event) => {
    const target = event.target;
    if (target.classList.contains('overlay') || target.classList.contains('modal-close')) {
        closeModal();
    }
});


// scroll smooth

{
    const scrollLinks = document.querySelectorAll('a.scroll-link');

    for (const scrollLink of scrollLinks) {
        scrollLink.addEventListener('click', event => {
            event.preventDefault();
            const id = scrollLink.getAttribute('href');
            document.querySelector(id).scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            })
        });
    }
}

// goods

const createCard = function ({ label, name, img, description, id, price }) {
    const card = document.createElement('div');
    card.className = 'col-lg-3 col-sm-6';

    card.innerHTML = `
        <div class="goods-card">
            ${label ?
            `<span class="label">${label}</span>` :
            ''}
            <img src="db/${img}" alt="${name}" class="goods-image">
            <h3 class="goods-title">${name}</h3>
            <p class="goods-description">${description}</p>
            <button class="button goods-card-btn add-to-cart" data-id="${id}">
                <span class="button-price">$${price}</span>
            </button>
		</div>
    `;

    return card;
}

const renderCards = function (data) {
    longGoodsList.textContent = '';
    const cards = data.map(createCard)
    longGoodsList.append(...cards);
    document.body.classList.add('show-goods')
};

const showAll = function (event) {
    event.preventDefault();
    getGoods().then(renderCards);
};

viewAll.forEach(function (elem) {
    elem.addEventListener('click', showAll);
});

const filterCards = function (field, value) {
    getGoods()
        .then(data => data.filter(good => good[field] === value))
        .then(renderCards);
};

navigationLink.forEach(function (link) {
    link.addEventListener('click', event => {
        event.preventDefault();
        const field = link.dataset.field;
        const value = link.textContent;
        filterCards(field, value);
    })
});

showAcsessories.forEach(item => {
    item.addEventListener('click', event => {
        event.preventDefault();
        filterCards('category', 'Accessories');
    });
});

showClothing.forEach(item => {
    item.addEventListener('click', event => {
        event.preventDefault();
        filterCards('category', 'Clothing');
    });
});

//

const modalForm = document.querySelector('.modal-form');

const postData = dataUser => fetch('server.php', {
    method: 'POST',
    body: dataUser,
});

modalForm.addEventListener('submit', event => {
    event.preventDefault();

    const formData = new FormData(modalForm);
    formData.append('cart', JSON.stringify(cart.cartGoods));

    postData(formData)
        .then(response => {
            if (!response.ok) {
                throw new Error(response.status);
            }
            alert('Ваш заказ успешно отправлен');
            console.log(response.statusText);
        })
        .catch(err => {
            alert('К сожалению произошла ошибка, повторите попытку позже');
            console.error(err);
        })
        .finally(() => {
            closeModal();
            modalForm.reset();
            cart.cartGoods.length = 0;
            cart.updateCart();
        });
});





