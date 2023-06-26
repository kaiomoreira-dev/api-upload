import { FindUserByIdUseCase } from './findById-user.usecase';
import { FindUserByIdController } from './findById-user.controller';
import { HttpService } from '@nestjs/axios';

describe('FindUserByIdController', () => {
    let findUserByIdController: FindUserByIdController;
    let findUserByIdUseCase: FindUserByIdUseCase;
    let httpService: HttpService;

    beforeEach(() => {
        httpService = new HttpService();
        findUserByIdUseCase = new FindUserByIdUseCase(httpService);
        findUserByIdController = new FindUserByIdController(
            findUserByIdUseCase,
        );
    });

    describe('findById', () => {
        it('should call findUserByIdUseCase.execute with the provided id and return the result', () => {
            // Arrange
            const id = 1;
            const user = { id: 1, name: 'John Doe' };

            jest.spyOn(findUserByIdUseCase, 'execute').mockResolvedValue(user);

            // Act
            const result = findUserByIdController.findById(id);

            // Assert
            expect(findUserByIdUseCase.execute).toHaveBeenCalledWith(id);
            expect(result).resolves.toEqual(user);
        });
    });
});
