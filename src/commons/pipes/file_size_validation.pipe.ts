import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileSizeValidationPipe implements PipeTransform {
    transform(value: any) {
        const FIVE_MB = 1024 * 1024 * 5;

        if (!value) return

        console.log(value)

        for (let key of Object.keys(value)) {
            if (value[key][0].size > FIVE_MB) {
                console.log('executed');
                throw new BadRequestException('Image too big, max size is 5mb');
            }
            if (!/image\/.*/.test(value[key][0].mimetype)) {
                throw new BadRequestException('Only image formats are allowed');
            }
        }

        return value;
    }
}

@Injectable()
export class SingleImageSizeValidationPipe implements PipeTransform {
    transform(value: any) {
        const FIVE_MB = 1024 * 1024 * 5;

        if (!value) return

        console.log(value)

        for (let key of Object.keys(value)) {
            if (value[key][0].size > FIVE_MB) {
                console.log('executed');
                throw new BadRequestException('Image too big, max size is 5mb');
            }
            if (!/image\/.*/.test(value[key][0].mimetype)) {
                throw new BadRequestException('Only image formats are allowed');
            }
        }

        return value;
    }
}
