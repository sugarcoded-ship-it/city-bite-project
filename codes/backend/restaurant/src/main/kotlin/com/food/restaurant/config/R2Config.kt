package com.food.restaurant.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider
import software.amazon.awssdk.regions.Region
import software.amazon.awssdk.services.s3.S3Client
import java.net.URI

@Configuration
class R2Config(
    @Value("\${r2.account-id}") private val accountId: String,
    @Value("\${r2.access-key-id}") private val accessKeyId: String,
    @Value("\${r2.secret-access-key}") private val secretAccessKey: String
) {
    @Bean
    fun s3Client(): S3Client {
        // Fallback to a dummy endpoint if accountId is empty to prevent application context failure
        val endpoint = if (accountId.isNotBlank()) {
            "https://${accountId}.r2.cloudflarestorage.com"
        } else {
            "https://dummy.r2.cloudflarestorage.com"
        }
        
        val credentials = if (accessKeyId.isNotBlank() && secretAccessKey.isNotBlank()) {
            AwsBasicCredentials.create(accessKeyId, secretAccessKey)
        } else {
            AwsBasicCredentials.create("dummy", "dummy")
        }
        
        return S3Client.builder()
            .endpointOverride(URI.create(endpoint))
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .region(Region.of("auto"))
            .build()
    }
}
