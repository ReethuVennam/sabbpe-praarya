package com.buyglimmer.backend.controller;

import com.buyglimmer.backend.dto.ApiWrapperRequest;
import com.buyglimmer.backend.dto.ApiWrapperResponse;
import com.buyglimmer.backend.dto.FintechDtos;
import com.buyglimmer.backend.service.AuthService;
import com.buyglimmer.backend.service.PaymentStatusService;
import com.buyglimmer.backend.util.ApiResponseFactory;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentStatusController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentStatusController.class);

    private final AuthService authService;
    private final PaymentStatusService paymentStatusService;
    private final ApiResponseFactory apiResponseFactory;

    public PaymentStatusController(AuthService authService, PaymentStatusService paymentStatusService, ApiResponseFactory apiResponseFactory) {
        this.authService = authService;
        this.paymentStatusService = paymentStatusService;
        this.apiResponseFactory = apiResponseFactory;
    }

    @PostMapping("/update-status")
    public ApiWrapperResponse<FintechDtos.PaymentStatusUpdateResponse> updateStatus(
            @Valid @RequestBody ApiWrapperRequest<FintechDtos.PaymentStatusUpdateRequest> request) {
        authService.assertCustomerOwnership(request.token(), request.data().customerId());
        logger.info("POST /api/v1/payments/update-status requestId={}", request.requestId());
        return apiResponseFactory.success(
                request.requestId(),
                "Payment status updated successfully",
                paymentStatusService.updateOrderPaymentStatusForCustomer(request.data().customerId(), request.data())
        );
    }

    @PostMapping("/sabbpe/callback")
    public ResponseEntity<String> sabbpeCallback(
            @RequestBody Map<String, String> request) {
        String gatewayRef = request.get("merchant_order_ref");
        String status = request.get("status");
        String gatewayTxnId = request.get("master_transaction_id");
        logger.info("SabbPe callback received: gatewayRef={} status={} txnId={}", gatewayRef, status, gatewayTxnId);
        if (gatewayRef == null || status == null) {
            logger.warn("SabbPe callback missing required fields");
            return ResponseEntity.badRequest().body("missing fields");
        }
        paymentStatusService.updateOrderPaymentStatusByGatewayRef(gatewayRef, status.toUpperCase(), gatewayTxnId);
        return ResponseEntity.ok("OK");
    }
}
