var formRules = {
};

var classRules = {
        username: {
            required: true,
            rangelength: [0,60]
        },
        password: {
            required: true, 
            rangelength: [0,20]
        },
        subUrl: {
            required: true,
            latin_only:true
        },
        title: {
            required: true,
            rangelength: [0,500]
        },
        title: {
            rangelength: [0,250]
        }
};

var formMessages = {
};

function formWrapNewFieldElements(scope) {
    for (var c in classRules) {
        var r=classRules[c];
        var ml;
        if (r.maxlength) ml=r.maxlength;
        else if (r.rangelength) ml=r.rangelength[1];
        else ml=-1;
        if (ml>0) $("."+c,scope).attr("maxlength", ml);
    }
}

function initFormValidator() {
	
	function createResetFunction(form) { return function () { restoreFormValues(form); }};

	$.validator.addClassRules(classRules);
	
	formWrapNewFieldElements();
    
    $.validator.addMethod("latin_only", function(value, element) {
            return this.optional(element) || /^[0-9A-Za-z_\-]+$/.test(value);
        },
        "This field may contain only letters from A to Z, digits and symbols '-' and '_'"
    );  


        $("form").each(function() {
            var form=$(this);

            var x={};
            x.rules=formRules;
            x.messages=formMessages;

            var names=[form.attr("name"), form.attr("id")];
            var onResetFormHandler=undefined;
            for (var i=0; i<names.length; i++) {
                var name=names[i];
                if (name) {
                    if (!x.submitHandler) {
                        var f=window["onSubmitForm_"+name];
                        if (typeof (f)=="function") x.submitHandler=f;
                    }
                    if (!x.invalidHandler) {
                        var f=window["onInvalidForm_"+name];
                        if (typeof (f)=="function") x.invalidHandler=f;
                    }
                    if (!x.beforeValidationForm) {
                        var f=window["onBeforeValidationForm_"+name];
                        if (typeof (f)=="function") x.beforeValidationForm=f;
                    }
                    if (!onResetFormHandler) {
                        var f=window["onResetForm_"+name];
                        if (typeof (f)=="function") onResetFormHandler=f;
                    }
                }
            }

            if (!onResetFormHandler) onResetFormHandler=createResetFunction(form);
            $('input[type="button"][value="Cancel"]', form).click(onResetFormHandler);

            form.validate(x);
        });
}

