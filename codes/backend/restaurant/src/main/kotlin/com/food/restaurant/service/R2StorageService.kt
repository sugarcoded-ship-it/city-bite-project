package com.food.restaurant.service

import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import software.amazon.awssdk.core.sync.RequestBody
import software.amazon.awssdk.services.s3.S3Client
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest
import software.amazon.awssdk.services.s3.model.PutObjectRequest
import java.util.UUID

@Service
class R2StorageService(
    private val s3Client: S3Client,
    @Value("\${r2.bucket-name}") private val bucketName: String,
    @Value("\${r2.public-url}") private val publicUrl: String
) : StorageService {

    override fun uploadFile(file: MultipartFile, folder: String): String {
        val extension = file.originalFilename?.substringAfterLast(".", "") ?: ""
        val fileName = if (folder.isNotBlank()) {
            "$folder/${UUID.randomUUID()}.$extension"
        } else {
            "${UUID.randomUUID()}.$extension"
        }

        val putObjectRequest = PutObjectRequest.builder()
            .bucket(bucketName)
            .key(fileName)
            .contentType(file.contentType)
            .build()

        s3Client.putObject(
            putObjectRequest,
            RequestBody.fromInputStream(file.inputStream, file.size)
        )

        // Return the public URL
        val baseUrl = publicUrl.removeSuffix("/")
        return "$baseUrl/$fileName"
    }

    override fun deleteFile(fileUrl: String) {
        val baseUrl = publicUrl.removeSuffix("/")
        if (!fileUrl.startsWith(baseUrl)) {
            // Not a file managed by this bucket
            return
        }
        
        val key = fileUrl.removePrefix("$baseUrl/")
        
        val deleteObjectRequest = DeleteObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .build()
            
        s3Client.deleteObject(deleteObjectRequest)
    }
}
