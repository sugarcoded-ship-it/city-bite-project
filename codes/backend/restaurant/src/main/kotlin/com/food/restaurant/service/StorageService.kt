package com.food.restaurant.service

import org.springframework.web.multipart.MultipartFile

interface StorageService {
    fun uploadFile(file: MultipartFile, folder: String = ""): String
    fun deleteFile(fileUrl: String)
}
