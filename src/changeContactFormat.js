function formatContactNumber(phone) {
    phoneInput = phone
    const userInput = phoneInput.trim();
    const countryCode = "+63";

    if (userInput.length > 0) {
        const formattedNumber = countryCode + userInput.substring(1);
        return formattedNumber
    } else {
        formattedNumber = "";
        }
    }

module.exports = formatContactNumber