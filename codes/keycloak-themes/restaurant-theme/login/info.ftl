<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=false; section>

    <#if section = "form">
        <div class="cb-form-card">
            <!-- Mobile Logo -->
            <div class="cb-mobile-logo">
                <img src="${url.resourcesPath}/img/citybitelogo2.png" alt="CityBite Logo" />
            </div>

            <h1 class="cb-form-title">Information</h1>

            <#if message?has_content>
                <div class="cb-alert cb-alert-${message.type}">
                    ${kcSanitize(message.summary)?no_esc}
                </div>
            </#if>

            <#if skipLink??>
            <#else>
                <#if pageRedirectUri?has_content>
                    <a href="${pageRedirectUri}" class="cb-btn-primary" style="text-align:center; display:block; text-decoration:none; margin-top:24px;">
                        ${kcSanitize(msg("backToApplication"))?no_esc}
                    </a>
                <#elseif actionUri?has_content>
                    <a href="${actionUri}" class="cb-btn-primary" style="text-align:center; display:block; text-decoration:none; margin-top:24px;">
                        ${kcSanitize(msg("proceedWithAction"))?no_esc}
                    </a>
                <#elseif (client.baseUrl)?has_content>
                    <a href="${client.baseUrl}" class="cb-btn-primary" style="text-align:center; display:block; text-decoration:none; margin-top:24px;">
                        ${kcSanitize(msg("backToApplication"))?no_esc}
                    </a>
                </#if>
            </#if>
        </div>
    </#if>

</@layout.registrationLayout>
