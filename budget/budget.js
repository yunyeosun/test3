//require('dotenv').config();
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

let accommodationPrice = 0;
let menuPrice = 0;
let travelPrice = 0;
let totalPrice = 0;
let menuName = "";
let menuImage = "";

async function getRestaurant(driver, placeName, placeAddress, type) {
    //search
    let splitAddress = placeAddress.split(' ')[0];
    const searchQuery = `${splitAddress} ${placeName}`;
    const searchUrl = `https://search.naver.com/search.naver?query=${searchQuery}`;
    await driver.get(searchUrl);

    //getPrice
    try {
        await driver.wait(until.elementLocated(By.className('gl2cc')), 3000);//가격
        let priceArrElement1 = await driver.findElement(By.className('gl2cc'));
        menuPrice = await priceArrElement1.getText();
        menuPrice = menuPrice.replace(/^([\d,]+)~/, '');
        menuPrice = menuPrice.replace(/[^\d]/g, '');

        await driver.wait(until.elementLocated(By.className('VQvNX')), 3000);//이름
        let nameElement1 = await driver.findElement(By.className('VQvNX'));
        menuName = await nameElement1.getText();

        await driver.wait(until.elementLocated(By.className('place_thumb')), 3000);//사진
        let imageElement1 = await driver.findElement(By.css('.place_thumb img'));
        menuImage = await imageElement1.getAttribute('src');

    } catch (error1) {
        try {
            await driver.wait(until.elementLocated(By.className('CLSES')), 3000);//가격
            let priceArrElement2 = await driver.findElement(By.className('CLSES'));
            menuPrice = await priceArrElement2.getText();
            menuPrice = menuPrice.replace(/^([\d,]+)~/, '');
            menuPrice = menuPrice.replace(/[^\d]/g, '');

            let totalTag = await driver.wait(until.elementLocated(By.className('JLkY7')), 3000);//이름
            let nameElement2 = await totalTag.findElement(By.className('A_cdD'));
            menuName = await nameElement2.getText();

            menuImage = null; //사진

        } catch (error2) {
            try {
                await driver.wait(until.elementLocated(By.className('mkBm3')), 3000);//가격
                let priceArrElement3 = await driver.findElement(By.className('mkBm3'));
                menuPrice = await priceArrElement3.getText();
                menuPrice = menuPrice.replace(/^([\d,]+)~/, '');
                menuPrice = menuPrice.replace(/[^\d]/g, '');

                await driver.wait(until.elementLocated(By.className('Fi0vA')), 3000);//이름
                let nameElement3 = await driver.findElement(By.className('Fi0vA'));
                menuName = await nameElement3.getText();

                menuImage = null; //사진

            } catch (error3) {
                menuPrice = 0;
                menuImage = null;
                menuName = null;
            }
        }
    }
}

async function getAccommodation(driver, placeName, placeAddress, type) {
    //search
    let splitAddress = placeAddress.split(' ')[0];
    const searchQuery = `${splitAddress} ${placeName}`;
    const searchUrl = `https://search.naver.com/search.naver?query=${searchQuery}`;
    await driver.get(searchUrl);

    //getPrice
    try {
        await driver.wait(until.elementLocated(By.className('CLSES')), 3000);
        let priceArrElementByOriginal = await driver.findElement(By.className('CLSES'));
        accommodationPrice = await priceArrElementByOriginal.getText();
        accommodationPrice = accommodationPrice.replace(/[^\d]/g, '');
    } catch (error1) {
        try {
            await driver.wait(until.elementLocated(By.className('aqscI')), 3000);
            let priceArrElementByCompare = await driver.findElement(By.className('aqscI'));
            accommodationPrice = await priceArrElementByCompare.getText();
            accommodationPrice = accommodationPrice.replace(/[^\d]/g, '');
        } catch (error2) {
            accommodationPrice = 0;
        }
    }
}

async function setBudget(user_info_list) {
    //console.log("Start SetBudget"); //DB에서 데이터 가져옴

    const results = [];

    // Promise.all을 사용하여 searchPlace를 병렬로 실행
    await Promise.all(user_info_list.map(async (user_info) => {
        accommodationPrice = 0;
        menuPrice = 0;
        travelPrice = 0;

        const type = user_info.information_type;
        const placeName = user_info.information_name;
        const placeAddress = user_info.information_address;

        try {
            if (type === '음식점') {
                const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3';
                const options = new chrome.Options().headless().addArguments(`user-agent=${userAgent}`, '--disable-gpu', '--disable-software-rasterizer').windowSize({ width: 1920, height: 1080 });
                const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build(); //
                await getRestaurant(driver, placeName, placeAddress, type);

            }
            else if (type === '숙소') {
                const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3';
                const options = new chrome.Options().headless().addArguments(`user-agent=${userAgent}`, '--disable-gpu', '--disable-software-rasterizer').windowSize({ width: 1920, height: 1080 });
                const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build(); //
                await getAccommodation(driver, placeName, placeAddress, type);
            }
            else { //(type === '여행지') {
                travelPrice = 0;
            }
        } catch (error) {
            console.error(error);
        } finally {
            if (type === '숙소') {
                if (accommodationPrice === 0) accommodationPrice = 70000;
                results.push({
                    placeName: placeName,
                    price: accommodationPrice
                });
                //console.log(placeName);
                //console.log(accommodationPrice);
                totalPrice += Number(accommodationPrice);
            } else if (type === '음식점') {
                if (menuPrice === 0) menuPrice = 12000;
                results.push({
                    placeName: placeName,
                    price: menuPrice,
                    name: menuName,
                    image: menuImage
                });
                //console.log(placeName);
                //console.log(menuPrice);
                //console.log(menuName);
                //console.log(menuImage);
                totalPrice += Number(menuPrice);
            } else if (type === '여행지') {
                // 여행지의 경우 가격 0
                results.push({
                    placeName: placeName,
                    price: 0
                });
            }
        }
    }));

    //await Promise.all(promises); // 병렬로 실행

    //console.log("totalPrice is " + totalPrice);
    return results;
}

module.exports = setBudget; // setBudget 함수를 모듈로 내보냄