<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm') ; section>

    <#if section = "form">
        <div class="cb-form-card">
            <!-- Mobile Logo -->
            <div class="cb-mobile-logo">
                <img src="${url.resourcesPath}/img/citybitelogo2.png" alt="CityBite Logo"
                     width="560" height="373" />
            </div>

            <!-- Tab Navigation -->
            <div class="cb-tabs">
                <a href="${url.loginUrl}" class="cb-tab">Log In</a>
                <span class="cb-tab active">Sign up</span>
            </div>

            <!-- Title -->
            <h1 class="cb-form-title">Create your account.</h1>
            <p class="cb-form-subtitle">Fill in the details to get started.</p>

            <!-- Error Messages -->
            <#assign displayGlobalError = true>
            <#if messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm')>
                <#assign displayGlobalError = false>
            </#if>

            <#if messagesPerField.existsError('firstName')>
                <div class="cb-alert cb-alert-error">${kcSanitize(messagesPerField.getFirstError('firstName'))?no_esc}</div>
            </#if>
            <#if messagesPerField.existsError('lastName')>
                <div class="cb-alert cb-alert-error">${kcSanitize(messagesPerField.getFirstError('lastName'))?no_esc}</div>
            </#if>
            <#if messagesPerField.existsError('email')>
                <div class="cb-alert cb-alert-error">${kcSanitize(messagesPerField.getFirstError('email'))?no_esc}</div>
            </#if>
            <#if messagesPerField.existsError('username')>
                <div class="cb-alert cb-alert-error">${kcSanitize(messagesPerField.getFirstError('username'))?no_esc}</div>
            </#if>
            <#if messagesPerField.existsError('password')>
                <div class="cb-alert cb-alert-error">${kcSanitize(messagesPerField.getFirstError('password'))?no_esc}</div>
            </#if>
            <#if messagesPerField.existsError('password-confirm')>
                <div class="cb-alert cb-alert-error">${kcSanitize(messagesPerField.getFirstError('password-confirm'))?no_esc}</div>
            </#if>

            <#if message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                <#if message.type = 'error' && displayGlobalError>
                    <div class="cb-alert cb-alert-error">${kcSanitize(message.summary)?no_esc}</div>
                <#elseif message.type = 'success'>
                    <div class="cb-alert cb-alert-success">${kcSanitize(message.summary)?no_esc}</div>
                <#elseif message.type = 'warning'>
                    <div class="cb-alert cb-alert-warning">${kcSanitize(message.summary)?no_esc}</div>
                <#elseif message.type = 'info'>
                    <div class="cb-alert cb-alert-info">${kcSanitize(message.summary)?no_esc}</div>
                </#if>
            </#if>

            <!-- Registration Form -->
            <form id="kc-register-form" action="${url.registrationAction}" method="post">

                <!-- First & Last Name -->
                <div style="display:flex; gap:12px;">
                    <div class="cb-form-group" style="flex:1">
                        <label for="firstName">${msg("firstName")} <span class="cb-required">*</span></label>
                        <input tabindex="1" id="firstName" name="firstName" type="text"
                               value="${(register.formData.firstName!'')}"
                               placeholder="${msg("firstName")}" />
                    </div>
                    <div class="cb-form-group" style="flex:1">
                        <label for="lastName">${msg("lastName")} <span class="cb-required">*</span></label>
                        <input tabindex="2" id="lastName" name="lastName" type="text"
                               value="${(register.formData.lastName!'')}"
                               placeholder="${msg("lastName")}" />
                    </div>
                </div>

                <!-- Email -->
                <div class="cb-form-group">
                    <label for="email">${msg("email")} <span class="cb-required">*</span></label>
                    <input tabindex="3" id="email" name="email" type="email"
                           value="${(register.formData.email!'')}"
                           placeholder="${msg("email")}" autocomplete="email" />
                </div>

                <!-- Username (only if not using email as username) -->
                <#if !realm.registrationEmailAsUsername>
                    <div class="cb-form-group">
                        <label for="username">${msg("username")} <span class="cb-required">*</span></label>
                        <input tabindex="4" id="username" name="username" type="text"
                               value="${(register.formData.username!'')}"
                               placeholder="${msg("username")}" autocomplete="username" />
                    </div>
                </#if>

                <!-- Password -->
                <div class="cb-form-group">
                    <label for="password">${msg("password")} <span class="cb-required">*</span></label>
                    <div class="cb-password-wrapper">
                        <input tabindex="5" id="password" name="password" type="password"
                               placeholder="${msg("password")}" autocomplete="new-password" />
                    </div>
                </div>

                <!-- Confirm Password -->
                <div class="cb-form-group">
                    <label for="password-confirm">${msg("passwordConfirm")} <span class="cb-required">*</span></label>
                    <div class="cb-password-wrapper">
                        <input tabindex="6" id="password-confirm" name="password-confirm" type="password"
                               placeholder="${msg("passwordConfirm")}" autocomplete="new-password" />
                    </div>
                </div>

                <#if recaptchaRequired??>
                    <div class="cb-form-group">
                        <div class="g-recaptcha" data-size="compact" data-sitekey="${recaptchaSiteKey}"></div>
                    </div>
                </#if>

                <button tabindex="7" class="cb-btn-primary" type="submit" id="kc-register">
                    ${msg("doRegister")}
                </button>
            </form>

            <!-- Social Login -->
            <#if realm.password && social?? && social.providers??>
                <div class="cb-social-divider">
                    <span>Or sign up with</span>
                </div>
                <div class="cb-social-buttons">
                    <#list social.providers as p>
                        <a id="social-${p.alias}" class="cb-social-btn <#if p.alias == 'google'>google<#elseif p.alias == 'facebook'>facebook<#elseif p.alias == 'line'>line<#elseif p.alias == 'github'>github<#else>generic</#if>"
                           href="${p.loginUrl}">
                            <#if p.alias == 'google'>
                                <img src="${url.resourcesPath}/img/google-icon-logo.svg" alt="Google logo" />
                            </#if>
                            <span>Sign up with ${p.displayName!p.alias}</span>
                        </a>
                    </#list>
                </div>
            </#if>

            <!-- Login link -->
            <p class="cb-footer-text">
                Already have an account?
                <a href="${url.loginUrl}">Log in</a>
            </p>
        </div>
    </#if>

</@layout.registrationLayout>
