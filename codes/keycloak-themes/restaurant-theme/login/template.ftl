<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false showAnotherWayIfPresent=true>
<!DOCTYPE html>
<html lang="${(locale.currentLanguageTag)!'en'}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>${msg("loginTitle",(realm.displayName)!'CityBite')}</title>

    <#if properties.meta?has_content>
        <#list properties.meta?split(' ') as meta>
            <meta name="${meta?split('==')[0]}" content="${meta?split('==')[1]}"/>
        </#list>
    </#if>

    <!-- Preload logo to eliminate flicker between page navigations -->
    <link rel="preload" href="${url.resourcesPath}/img/citybitelogo2.png" as="image" type="image/png">

    <!-- Google Fonts – Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <#if properties.stylesCommon?has_content>
        <#list properties.stylesCommon?split(' ') as style>
            <link href="${url.resourcesCommonPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
    <#if properties.styles?has_content>
        <#list properties.styles?split(' ') as style>
            <link href="${url.resourcesPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>

    <#if properties.scripts?has_content>
        <#list properties.scripts?split(' ') as script>
            <script src="${url.resourcesPath}/${script}" type="text/javascript"></script>
        </#list>
    </#if>
</head>

<body>
    <!-- Back Button -->
    <a href="#" class="cb-back-btn" id="cb-back-button">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        <span>Back</span>
    </a>

    <div class="cb-login-wrapper">
        <!-- Left Brand Panel (desktop) -->
        <div class="cb-brand-panel">
            <img src="${url.resourcesPath}/img/citybitelogo2.png"
                 alt="CityBite Logo"
                 class="cb-brand-logo"
                 width="560" height="373"
                 fetchpriority="high" />
            <p class="cb-brand-tagline">Make Every Bite Feeling Good</p>
        </div>

        <!-- Right Form Panel -->
        <div class="cb-form-panel">
            <div id="kc-content">
                <div id="kc-content-wrapper">
                    <#nested "form">
                </div>
            </div>
        </div>
    </div>

</body>
</html>
</#macro>
