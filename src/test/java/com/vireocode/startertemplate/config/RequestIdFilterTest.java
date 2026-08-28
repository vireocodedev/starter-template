package com.vireocode.startertemplate.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RequestIdFilterTest {

    private final RequestIdFilter filter = new RequestIdFilter();

    @Test
    void preservesSafeRequestIdDuringRequestAndClearsLogContextAfterward() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(RequestIdFilter.HEADER, "edge-request:42");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicReference<String> observedLogContext = new AtomicReference<>();

        filter.doFilter(request, response,
                (innerRequest, innerResponse) -> observedLogContext.set(MDC.get("requestId")));

        assertEquals("edge-request:42", response.getHeader(RequestIdFilter.HEADER));
        assertEquals("edge-request:42", observedLogContext.get());
        assertNull(MDC.get("requestId"));
    }

    @Test
    void replacesUnsafeRequestIdBeforeItReachesHeadersOrLogs() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader(RequestIdFilter.HEADER, "unsafe\nlog-entry");
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicReference<String> observedLogContext = new AtomicReference<>();

        filter.doFilter(request, response,
                (innerRequest, innerResponse) -> observedLogContext.set(MDC.get("requestId")));

        String generated = response.getHeader(RequestIdFilter.HEADER);
        assertNotEquals("unsafe\nlog-entry", generated);
        assertTrue(generated.matches("[0-9a-f-]{36}"));
        assertEquals(generated, observedLogContext.get());
    }
}
