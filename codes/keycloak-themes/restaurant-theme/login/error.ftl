<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>

    <#if section = "form">
        <div class="cb-form-card">
            <!-- Mobile Logo -->
            <div class="cb-mobile-logo">
                <img src="${url.resourcesPath}/img/citybitelogo2.png" alt="CityBite Logo" />
            </div>

            <h1 class="cb-form-title">Oops! Something went wrong.</h1>
            <p class="cb-form-subtitle">We encountered an error processing your request.</p>

            <#if message?has_content>
                <div class="cb-alert cb-alert-error">
                    ${kcSanitize(message.summary)?no_esc}
                </div>
            </#if>

            <#if client?? && client.baseUrl?has_content>
                <a href="${client.baseUrl}" class="cb-btn-primary" style="text-align:center; display:block; text-decoration:none; margin-top:24px;">
                    Back to Application
                </a>
            </#if>
        </div>
    </#if>

</@layout.registrationLayout>
