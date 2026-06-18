<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>

    <#if section = "form">
        <div class="cb-form-card">
            <!-- Mobile Logo -->
            <div class="cb-mobile-logo">
                <img src="${url.resourcesPath}/img/citybitelogo2.png" alt="CityBite Logo" />
            </div>

            <!-- Tab Navigation -->
            <div class="cb-tabs">
                <span class="cb-tab active">Log In</span>
                <#if realm.registrationAllowed && !registrationDisabled??>
                    <a href="${url.registrationUrl}" class="cb-tab">Sign up</a>
                </#if>
            </div>

            <!-- Title -->
            <h1 class="cb-form-title">Log in to CityBite.</h1>
            <p class="cb-form-subtitle">Enter your details below.</p>

            <!-- Error / Info Messages -->
            <#assign displayGlobalError = true>
            <#if messagesPerField.existsError('username','password')>
                <div class="cb-alert cb-alert-error">
                    ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
                </div>
                <#assign displayGlobalError = false>
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

            <!-- Login Form -->
            <form id="kc-form-login" action="${url.loginAction}" method="post">
                <div class="cb-form-group">
                    <#if !realm.loginWithEmailAllowed>
                        <label for="username">${msg("username")}</label>
                        <input tabindex="1" id="username" name="username" type="text"
                               value="${(login.username!'')}"
                               placeholder="${msg("username")}"
                               autofocus autocomplete="off" />
                    <#elseif !realm.registrationEmailAsUsername>
                        <label for="username">${msg("usernameOrEmail")}</label>
                        <input tabindex="1" id="username" name="username" type="text"
                               value="${(login.username!'')}"
                               placeholder="${msg("usernameOrEmail")}"
                               autofocus autocomplete="off" />
                    <#else>
                        <label for="username">${msg("email")}</label>
                        <input tabindex="1" id="username" name="username" type="text"
                               value="${(login.username!'')}"
                               placeholder="${msg("email")}"
                               autofocus autocomplete="off" />
                    </#if>
                </div>

                <div class="cb-form-group">
                    <label for="password">${msg("password")}</label>
                    <div class="cb-password-wrapper">
                        <input tabindex="2" id="password" name="password" type="password"
                               placeholder="${msg("password")}"
                               autocomplete="off" />
                    </div>
                </div>

                <#-- Remember me & Forgot password -->
                <div class="cb-helper-links">
                    <#if realm.rememberMe && !usernameEditDisabled??>
                        <div class="cb-checkbox-group" style="margin-bottom:0">
                            <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox"
                                   <#if login.rememberMe??>checked</#if>>
                            <label for="rememberMe">${msg("rememberMe")}</label>
                        </div>
                    <#else>
                        <span></span>
                    </#if>
                    <#if realm.resetPasswordAllowed>
                        <a tabindex="5" href="${url.loginResetCredentialsUrl}">${msg("doForgotPassword")}</a>
                    </#if>
                </div>

                <input type="hidden" id="id-hidden-input" name="credentialId"
                       <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>

                <button tabindex="4" class="cb-btn-primary" type="submit" name="login" id="kc-login">
                    ${msg("doLogIn")}
                </button>
            </form>

            <!-- Social Login -->
            <#if realm.password && social.providers??>
                <div class="cb-social-divider">
                    <span>Or Log in with</span>
                </div>
                <div class="cb-social-buttons">
                    <#list social.providers as p>
                        <a id="social-${p.alias}" class="cb-social-btn <#if p.alias == 'google'>google<#elseif p.alias == 'facebook'>facebook<#elseif p.alias == 'line'>line<#elseif p.alias == 'github'>github<#else>generic</#if>"
                           href="${p.loginUrl}">
                            <#if p.alias == 'google'>
                                <img src="${url.resourcesPath}/img/google-icon-logo.svg" alt="Google logo" />
                            </#if>
                            <span>Log In with ${p.displayName!p.alias}</span>
                        </a>
                    </#list>
                </div>
            </#if>

            <!-- Registration link -->
            <#if realm.registrationAllowed && !registrationDisabled??>
                <p class="cb-footer-text">
                    Don't have an account?
                    <a href="${url.registrationUrl}">Sign up</a>
                </p>
            </#if>
        </div>
    </#if>

</@layout.registrationLayout>
