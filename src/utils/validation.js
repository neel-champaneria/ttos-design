export const required = value => (value ? undefined : "Required");
export const maxLength = max => value =>
    value && value.length > max ? `Must be ${max} characters or less` : undefined;
export const maxLength15 = maxLength(15);
export const minLength = min => value =>
    value && value.length < min ? `Must be ${min} characters or more` : undefined;
export const minLength8 = minLength(8);
export const minLength6 = minLength(6);

export const email = value =>
    value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,10}$/i.test(value)
        ? "Invalid email address"
        : undefined;
export const alphaNumeric = value =>
    value && /[^a-zA-Z0-9 ]/i.test(value)
        ? "Only alphanumeric characters"
        : undefined;

export const alphaNumericRule = value =>
    value && !/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/.test(value)
        ? "Wrong password format. Password need at least 8 alphanumeric with upper case, lower case"
        : undefined;

export const numeric = value =>
    value && /[^0-9 ]/i.test(value) ? "Only numeric characters" : undefined;

export const passwordsMatch = (value, allValues) =>
    value !== allValues.password ? `New passwords don't match` : undefined;

export const nricValidate = value =>
    value && !/^\d{3}[A-Z]$/.test(value)
        ? "Invalid NRIC"
        : undefined;

export const formikValidate = (params, p1) => {
    const {errors, touched} = params;
    let errorText = null;
    const p2 = p1.split('.');

    for (let tKey of Object.keys(touched)) {
        for (let eKey of Object.keys(errors)) {

            if (touched[p2[0]] instanceof Object && errors[p2[0]] instanceof Object) {
                for (let tKeyA of Object.keys(touched[p2[0]])) {
                    for (let eKeyA of Object.keys(errors[p2[0]])) {

                        if (touched[p2[0]][p2[1]] instanceof Object && errors[p2[0]][p2[1]] instanceof Object) {
                            for (let tKeyB of Object.keys(touched[p2[0]][p2[1]])) {
                                for (let eKeyA of Object.keys(errors[p2[0]][p2[1]])) {
                                    if (touched[p2[0]][p2[1]][p2[2]] && errors[p2[0]][p2[1]][p2[2]])
                                        errorText = errors[p2[0]][p2[1]][p2[2]];
                                }
                            }
                        } else {
                            if (touched[p2[0]][p2[1]] && errors[p2[0]][p2[1]])
                                errorText = errors[p2[0]][p2[1]];
                        }

                    }
                }
            } else {
                if (touched[p1] && errors[p1])
                    errorText = errors[p1];
            }

        }
    }

    return errorText;
};
