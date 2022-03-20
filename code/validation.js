

// validation object contruction
function Validation (options) {
    var formValidation = document.querySelector(options.form)

    function getParentElement (inputElement,selector) {
        while(inputElement.parentElement) {
            if (inputElement.parentElement.matches(selector)) {
                return inputElement.parentElement
            }
            inputElement = inputElement.parentElement
        }
    }

    function validate (inputElement,rule) {
        
        var rules = selectorRules[rule.selector]
        var errorElement = getParentElement(inputElement,options.formGroup).querySelector('.form-message')
        var errorMessage
        for (i = 0;i < rules.length ; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                   errorMessage = rules[i](formValidation.querySelector(rule.selector + ':checked'))
                break;
                default:
                   errorMessage = rules[i](inputElement.value)
            }
            if (errorMessage) break;
        }

        if (errorMessage) {
             errorElement.innerText = errorMessage
             getParentElement(inputElement,options.formGroup).classList.add('invalid')
        } else {
             errorElement.innerText = ''
             getParentElement(inputElement,options.formGroup).classList.remove('invalid')
        }
        return !errorMessage
        
    }
    
    var selectorRules = {}

// loop for all rules and validate all of them
    const validateAllRules = () => {

        options.rules.forEach(function (rule) {
            var inputElement = formValidation.querySelector(rule.selector)
            validate(inputElement,rule)
        })

    }

    // handle event onsubmit
    if (formValidation) {
        options.rules.forEach(function (rule) {
            var inputElements = formValidation.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach(function(inputElement) {
                inputElement.onblur = function () {
                    validate(inputElement,rule)
                    }
        
                    inputElement.oninput = function () {
                        var errorElement = getParentElement(inputElement,options.formGroup).querySelector('.form-message')
                        errorElement.innerText = ''
                        getParentElement(inputElement,options.formGroup).classList.remove('invalid')
                    }
            })

                        // save all rules
                        if (Array.isArray(selectorRules[rule.selector])) {
                            selectorRules[rule.selector].push(rule.test)
                        } else {
                            selectorRules[rule.selector] = [rule.test]
                        }          
        }) 
        let formValid = true
        // false no error
        // true error
        // submit event
        formValidation.onsubmit = function (e) {

            e.preventDefault()

            validateAllRules()
            var valid
            options.rules.forEach(function (rule) {
                var inputElement = formValidation.querySelector(rule.selector)
                valid = validate(inputElement,rule) 
            })
            if (valid === true) {
                formValid = false
            }

            if (formValid === false) {
                var enableInput = document.querySelectorAll('input[name]:not(disabled)')
                var enableSelect = document.querySelectorAll('select')

                var enableData = Array.from(enableInput).concat(Array.from(enableSelect))
                console.log(enableData)
                if (typeof options.onSubmit === 'function') {
                    var valueInput = enableData.reduce(function(data,input) {
                        
                        switch(input.type) {
                            case 'radio':
                                data[input.name] = document.querySelector('input[type="radio"]:checked').value
                                break;

                            case 'checkbox':
                                if (!input.matches(':checked')) return data

                                if (!Array.isArray(data[input.name])) {
                                    data[input.name] = []
                                }
                                data[input.name].push(input.value)
                                break;
                            
                            case 'file':
                                data[input.name] = []
                                data[input.name].push(input.value)
                                break;
                            default:
                                data[input.name] = input.value
                        }
                        return data
                    },{})


                    options.onSubmit(valueInput)

                }
            }
        }
    }


}

// validation rules
Validation.isRequired = function (selector,message) {
    return {
        selector: selector,
        test (value) {
            return value ? undefined : message || 'Please type your Name'
        }
    }
}
Validation.isEmail = function (selector,message) {
    return {
        selector: selector,
        test (value) {
            var regrexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regrexEmail.test(value) ? undefined : message || 'Please type your right email'
        }
    }
}
Validation.isMinLength = function (selector,min,message) {
    return {
        selector: selector,
        test (value) {
            return value.length >= min ? undefined : message || 'Please type enough charaters'
        }
    }
}
Validation.isConfirmed = function (selector,confirmValue,message) {
    return {
        selector: selector,
        test (value) {
            return value === confirmValue() ? undefined : message || 'Please type correct password'
        }
    }
}